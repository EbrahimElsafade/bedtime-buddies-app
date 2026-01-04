-- Create specialist_requests table to store contact form submissions
CREATE TABLE public.specialist_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.specialist_requests ENABLE ROW LEVEL SECURITY;

-- Only admins can view requests
CREATE POLICY "Admins can view all specialist requests"
ON public.specialist_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update requests
CREATE POLICY "Admins can update specialist requests"
ON public.specialist_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can insert (public contact form)
CREATE POLICY "Anyone can submit specialist requests"
ON public.specialist_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_specialist_requests_updated_at
BEFORE UPDATE ON public.specialist_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();