-- Add missing context columns to campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS topic text,
ADD COLUMN IF NOT EXISTS target_orientation text,
ADD COLUMN IF NOT EXISTS problem_solved text,
ADD COLUMN IF NOT EXISTS strategic_objective text,
ADD COLUMN IF NOT EXISTS duration_type text,
ADD COLUMN IF NOT EXISTS differential text;

-- Add helpful comments
COMMENT ON COLUMN public.campaigns.topic IS 'The main focus topic of the campaign captured in Step 1';
COMMENT ON COLUMN public.campaigns.target_orientation IS 'Specific audience orientation for this campaign';
COMMENT ON COLUMN public.campaigns.problem_solved IS 'The specific problem this campaign addresses';
COMMENT ON COLUMN public.campaigns.strategic_objective IS 'The refined strategic goal of the campaign';
COMMENT ON COLUMN public.campaigns.duration_type IS 'Duration of the campaign (e.g., Mensual, Trimestral)';
COMMENT ON COLUMN public.campaigns.differential IS 'The unique selling proposition or differential for this specific campaign';
