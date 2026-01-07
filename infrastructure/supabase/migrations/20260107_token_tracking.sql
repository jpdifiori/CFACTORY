-- 1. Balance de Tokens en el Perfil de Usuario
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_tokens_used BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS token_limit BIGINT DEFAULT 100000;

-- 2. Tabla de Auditoría de Consumo (CORREGIDA)
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    model_name TEXT NOT NULL,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER NOT NULL,
    feature_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar Seguridad (RLS)
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own usage logs') THEN
        CREATE POLICY "Users can view own usage logs" 
        ON ai_usage_logs FOR SELECT 
        TO authenticated 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- 4. Índice para rendimiento
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_date ON ai_usage_logs(user_id, created_at);
