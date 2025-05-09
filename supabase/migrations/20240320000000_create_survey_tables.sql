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

-- Enable RLS
alter table "public"."surveys" enable row level security;

-- Policy to allow anyone to read surveys (for shared links)
create policy "Allow anyone to read surveys"
on "public"."surveys"
for select
to anon, authenticated
using (true);

-- Policy to allow authenticated users to manage their own surveys
create policy "Allow users to manage their own surveys"
on "public"."surveys"
for all 
to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

-- Policy to allow anyone to update survey responses
create policy "Allow anyone to update survey responses"
on "public"."surveys"
for update
to anon, authenticated
using (true)
with check (true);

-- Add comment to explain the policies
comment on table "public"."surveys" is 'Surveys table with RLS policies for public access and response collection';

-- Create indexes for better performance
CREATE INDEX idx_surveys_created_by ON public.surveys(created_by);
CREATE INDEX idx_surveys_questions ON public.surveys USING GIN(questions);
CREATE INDEX idx_surveys_responses ON public.surveys USING GIN(responses); 