-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anyone to read surveys" ON public.surveys;
DROP POLICY IF EXISTS "Allow users to manage their own surveys" ON public.surveys;
DROP POLICY IF EXISTS "Allow anyone to update survey responses" ON public.surveys;

-- Create new policies
-- Policy to allow anyone to read surveys (for shared links)
CREATE POLICY "Allow anyone to read surveys"
ON public.surveys
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy to allow authenticated users to manage their own surveys
CREATE POLICY "Allow users to manage their own surveys"
ON public.surveys
FOR ALL 
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Policy to allow anyone to update survey responses
CREATE POLICY "Allow anyone to update survey responses"
ON public.surveys
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true); 