create table if not exists public.course_lesson_watch_progress (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null,
  course_id uuid not null,
  lesson_id uuid not null,
  watched_seconds integer not null default 0,
  duration_seconds integer not null default 0,
  watched_percent numeric(5,2) not null default 0,
  completed_at timestamp with time zone null,
  last_watched_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (user_id, lesson_id)
);

alter table public.course_lesson_watch_progress enable row level security;

create policy "Users can view their own lesson watch progress"
on public.course_lesson_watch_progress
for select
using (auth.uid() = user_id);

create policy "Users can create their own lesson watch progress"
on public.course_lesson_watch_progress
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own lesson watch progress"
on public.course_lesson_watch_progress
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists idx_course_lesson_watch_progress_user_course
on public.course_lesson_watch_progress(user_id, course_id);

create index if not exists idx_course_lesson_watch_progress_user_lesson
on public.course_lesson_watch_progress(user_id, lesson_id);

create trigger update_course_lesson_watch_progress_updated_at
before update on public.course_lesson_watch_progress
for each row
execute function public.update_updated_at_column();

create or replace function public.check_course_completion(_user_id uuid, _course_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  total_lessons integer;
  completed_lessons integer;
begin
  select count(*) into total_lessons
  from public.course_lessons
  where course_id = _course_id;

  select count(*) into completed_lessons
  from public.user_section_progress
  where user_id = _user_id
    and content_type = 'course_lesson'
    and parent_id = _course_id;

  return total_lessons > 0 and completed_lessons >= total_lessons;
end;
$$;

create or replace function public.record_course_lesson_watch_progress(
  _user_id uuid,
  _course_id uuid,
  _lesson_id uuid,
  _watched_seconds integer default 0,
  _duration_seconds integer default 0,
  _explicit_complete boolean default false,
  _completion_threshold numeric default 85
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_watched integer := greatest(coalesce(_watched_seconds, 0), 0);
  normalized_duration integer := greatest(coalesce(_duration_seconds, 0), 0);
  calculated_percent numeric(5,2) := 0;
  existing_completed_at timestamp with time zone;
  should_complete boolean := false;
  progress_result jsonb := '{"newly_completed": false, "points_awarded": false}'::jsonb;
begin
  if auth.uid() is null or auth.uid() <> _user_id then
    raise exception 'Not allowed to record watch progress for this user';
  end if;

  if not exists (
    select 1
    from public.course_lessons
    where id = _lesson_id
      and course_id = _course_id
  ) then
    raise exception 'Lesson does not belong to this course';
  end if;

  if normalized_duration > 0 then
    calculated_percent := least(100, round((normalized_watched::numeric / normalized_duration::numeric) * 100, 2));
  elsif _explicit_complete then
    calculated_percent := 100;
  end if;

  select completed_at into existing_completed_at
  from public.course_lesson_watch_progress
  where user_id = _user_id and lesson_id = _lesson_id;

  should_complete := _explicit_complete or calculated_percent >= least(greatest(coalesce(_completion_threshold, 85), 1), 100);

  insert into public.course_lesson_watch_progress (
    user_id,
    course_id,
    lesson_id,
    watched_seconds,
    duration_seconds,
    watched_percent,
    completed_at,
    last_watched_at
  ) values (
    _user_id,
    _course_id,
    _lesson_id,
    normalized_watched,
    normalized_duration,
    calculated_percent,
    case when should_complete then now() else null end,
    now()
  )
  on conflict (user_id, lesson_id) do update
  set watched_seconds = greatest(public.course_lesson_watch_progress.watched_seconds, excluded.watched_seconds),
      duration_seconds = greatest(public.course_lesson_watch_progress.duration_seconds, excluded.duration_seconds),
      watched_percent = greatest(public.course_lesson_watch_progress.watched_percent, excluded.watched_percent),
      completed_at = coalesce(public.course_lesson_watch_progress.completed_at, excluded.completed_at),
      last_watched_at = now();

  if should_complete and existing_completed_at is null then
    progress_result := public.record_content_progress(_user_id, 'course_lesson', _lesson_id, _course_id);
  end if;

  return jsonb_build_object(
    'completed', should_complete or existing_completed_at is not null,
    'watched_percent', calculated_percent,
    'newly_completed', coalesce((progress_result->>'newly_completed')::boolean, false),
    'points_awarded', coalesce((progress_result->>'points_awarded')::boolean, false)
  );
end;
$$;