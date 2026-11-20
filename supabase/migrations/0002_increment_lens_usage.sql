create or replace function public.increment_lens_usage(
  p_day date,
  p_limit integer
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_limit <= 0 then
    raise exception 'Quota limit must be positive';
  end if;

  insert into public.usage_counters (user_id, day, lens_count)
  values (auth.uid(), p_day, 1)
  on conflict (user_id, day) do update
    set lens_count = public.usage_counters.lens_count + 1
    where public.usage_counters.lens_count < p_limit
  returning lens_count into v_count;

  return v_count;
end;
$$;

revoke all on function public.increment_lens_usage(date, integer) from public;
grant execute on function public.increment_lens_usage(date, integer) to authenticated;
