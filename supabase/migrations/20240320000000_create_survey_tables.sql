-- Create surveys table
CREATE TABLE public.surveys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    questions JSONB DEFAULT '[]'::jsonb,
    responses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own surveys"
    ON public.surveys
    FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own surveys"
    ON public.surveys
    FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own surveys"
    ON public.surveys
    FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own surveys"
    ON public.surveys
    FOR DELETE
    USING (auth.uid() = created_by);

-- Create indexes for better performance
CREATE INDEX idx_surveys_created_by ON public.surveys(created_by);
CREATE INDEX idx_surveys_questions ON public.surveys USING GIN(questions);
CREATE INDEX idx_surveys_responses ON public.surveys USING GIN(responses); 