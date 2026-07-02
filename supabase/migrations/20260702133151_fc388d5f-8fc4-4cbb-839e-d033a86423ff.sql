
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;

drop policy if exists "staff insert check-ins" on public.check_ins;
create policy "staff insert check-ins" on public.check_ins for insert to authenticated
  with check (public.has_role(auth.uid(),'staff') or public.has_role(auth.uid(),'admin'));
