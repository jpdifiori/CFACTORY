-- 1. Balance de Tokens en el Perfil de Usuario
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_tokens_used BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS token_limit BIGINT DEFAULT 100000;

-- 2. Tabla de Auditoría de Consumo
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

-- 4. Polizas de RLS para ai_usage_logs
DO $$ 
BEGIN
    -- Ver logs propios
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own usage logs') THEN
        CREATE POLICY "Users can view own usage logs" 
        ON ai_usage_logs FOR SELECT 
        TO authenticated 
        USING (auth.uid() = user_id);
    END IF;

    -- Insertar logs propios
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own usage logs') THEN
        CREATE POLICY "Users can insert own usage logs" 
        ON ai_usage_logs FOR INSERT 
        TO authenticated 
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 5. Polizas de RLS para profiles (Update tokens fallback)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own token count') THEN
        CREATE POLICY "Users can update their own token count" 
        ON profiles FOR UPDATE
        TO authenticated
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- 6. RPC para Incremento Atómico de Tokens
CREATE OR REPLACE FUNCTION increment_user_tokens(user_id UUID, tokens_to_add BIGINT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO profiles (id, total_tokens_used)
  VALUES (user_id, tokens_to_add)
  ON CONFLICT (id) DO UPDATE 
  SET total_tokens_used = profiles.total_tokens_used + tokens_to_add;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Permisos de ejecución para el RPC
GRANT EXECUTE ON FUNCTION increment_user_tokens(UUID, BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_user_tokens(UUID, BIGINT) TO service_role;

-- 8. Índice para rendimiento
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_date ON ai_usage_logs(user_id, created_at);
