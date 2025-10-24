-- Fix recursive RLS on user_roles and ensure helper functions exist
-- 1) Ensure helpers exist (safe with CREATE OR REPLACE)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin'::app_role);
$$;

-- 2) Replace problematic policy that caused recursion
drop policy if exists "Only admins can manage roles" on public.user_roles;

-- 3) Create non-recursive policies using security definer function
create policy "Admins can manage roles"
on public.user_roles
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'::app_role))
with check (public.has_role(auth.uid(), 'admin'::app_role));

-- Keep existing policy allowing users to view their own roles (if it already exists it will coexist)
-- create policy "Users can view their own roles"
-- on public.user_roles
-- for select
-- to authenticated
-- using (auth.uid() = user_id);
