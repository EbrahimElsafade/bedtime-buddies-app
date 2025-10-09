-- Create audit log table for role changes
CREATE TABLE IF NOT EXISTS public.user_role_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('granted', 'revoked')),
  performed_by UUID NOT NULL,
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS on audit log
ALTER TABLE public.user_role_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.user_role_audit_log
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX idx_user_role_audit_log_user_id ON public.user_role_audit_log(user_id);
CREATE INDEX idx_user_role_audit_log_performed_by ON public.user_role_audit_log(performed_by);
CREATE INDEX idx_user_role_audit_log_performed_at ON public.user_role_audit_log(performed_at DESC);

-- Create function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.user_role_audit_log (user_id, role, action, performed_by)
    VALUES (NEW.user_id, NEW.role, 'granted', auth.uid());
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.user_role_audit_log (user_id, role, action, performed_by)
    VALUES (OLD.user_id, OLD.role, 'revoked', auth.uid());
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger to automatically log role changes
CREATE TRIGGER user_role_change_audit
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.log_role_change();

-- Add comment to explain the security measure
COMMENT ON TABLE public.user_role_audit_log IS 'Audit log for all role changes. Immutable record to detect unauthorized privilege escalation.';