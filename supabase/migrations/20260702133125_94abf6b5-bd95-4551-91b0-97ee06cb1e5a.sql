
-- Roles
create type public.app_role as enum ('admin','staff');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

create policy "read own roles" on public.user_roles for select to authenticated using (auth.uid()=user_id);

-- Students
create table public.students (
  id uuid primary key default gen_random_uuid(),
  student_id text not null unique,
  name text not null,
  hostel text not null default 'Female Hostel',
  room_no text,
  nfc_uid text unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.students to authenticated;
grant all on public.students to service_role;
alter table public.students enable row level security;
create policy "staff read students" on public.students for select to authenticated using (true);
create policy "admin write students" on public.students for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Meal sessions
create type public.meal_type as enum ('breakfast','lunch','snacks','dinner');

create table public.meal_sessions (
  id uuid primary key default gen_random_uuid(),
  session_type meal_type not null,
  meal_name text not null,
  meal_date date not null default current_date,
  start_time time not null,
  end_time time not null,
  expected_count int not null default 0,
  created_at timestamptz not null default now(),
  unique(session_type, meal_date)
);
grant select, insert, update, delete on public.meal_sessions to authenticated;
grant all on public.meal_sessions to service_role;
alter table public.meal_sessions enable row level security;
create policy "read meal sessions" on public.meal_sessions for select to authenticated using (true);
create policy "admin write meal sessions" on public.meal_sessions for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Check-ins
create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  session_id uuid not null references public.meal_sessions(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  method text not null default 'NFC Card',
  unique(student_id, session_id)
);
grant select, insert, update, delete on public.check_ins to authenticated;
grant all on public.check_ins to service_role;
alter table public.check_ins enable row level security;
create policy "read check-ins" on public.check_ins for select to authenticated using (true);
create policy "staff insert check-ins" on public.check_ins for insert to authenticated with check (true);
create policy "admin manage check-ins" on public.check_ins for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Seed sample data
insert into public.students (student_id, name, room_no, nfc_uid) values
  ('21BCS1023','Ayesha Khan','A-101','NFC001'),
  ('21BEC1045','Fathima Noor','A-102','NFC002'),
  ('21BME1078','Sana Fathima','A-103','NFC003'),
  ('21BIT1089','Hibah Thasneem','A-104','NFC004'),
  ('21BCE1102','K. Nivetha','A-105','NFC005'),
  ('21BCS1124','Zara Ahmed','A-106','NFC006'),
  ('21BEC1156','Priya Sharma','A-107','NFC007'),
  ('21BME1189','Ananya Reddy','A-108','NFC008');

insert into public.meal_sessions (session_type, meal_name, start_time, end_time, expected_count) values
  ('breakfast','Breakfast','07:00','09:00',420),
  ('lunch','Lunch','12:00','14:00',420),
  ('snacks','Evening Snacks','16:00','17:00',420),
  ('dinner','Dinner','19:00','21:00',420);
