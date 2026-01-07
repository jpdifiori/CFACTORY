-- RPC for Atomic Token Increment
CREATE OR REPLACE FUNCTION increment_user_tokens(user_id UUID, tokens_to_add BIGINT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO profiles (id, total_tokens_used)
  VALUES (user_id, tokens_to_add)
  ON CONFLICT (id) DO UPDATE 
  SET total_tokens_used = profiles.total_tokens_used + tokens_to_add;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
