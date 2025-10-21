-- Add append-only protection to audit log table
-- This prevents tampering with security audit records

-- Prevent direct inserts (only trigger can insert via SECURITY DEFINER)
CREATE POLICY "Prevent direct audit log inserts"
ON public.user_role_audit_log
FOR INSERT
WITH CHECK (false);

-- Prevent any updates to audit logs (immutable records)
CREATE POLICY "Prevent audit log modifications"
ON public.user_role_audit_log
FOR UPDATE
USING (false);

-- Prevent any deletions of audit logs (permanent records)
CREATE POLICY "Prevent audit log deletion"
ON public.user_role_audit_log
FOR DELETE
USING (false);

-- The existing log_role_change() trigger function uses SECURITY DEFINER,
-- so it can still insert logs despite the false INSERT policy