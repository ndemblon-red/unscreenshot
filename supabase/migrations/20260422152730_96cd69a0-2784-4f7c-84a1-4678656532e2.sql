CREATE TABLE public.analysis_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_analysis_usage_user_id ON public.analysis_usage(user_id);

ALTER TABLE public.analysis_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analysis usage"
ON public.analysis_usage
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert analysis usage"
ON public.analysis_usage
FOR INSERT
TO service_role
WITH CHECK (true);