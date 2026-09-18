alter table public.profiles
  drop constraint if exists profiles_education_object_check;

alter table public.profiles
  alter column education drop default;

update public.profiles
set education = case
  when jsonb_typeof(education) = 'array' then education
  when jsonb_typeof(education) = 'object' and education <> '{}'::jsonb
    then jsonb_build_array(education)
  else '[]'::jsonb
end;

alter table public.profiles
  alter column education set default '[]'::jsonb,
  add constraint profiles_education_array_check
    check (
      jsonb_typeof(education) = 'array'
      and jsonb_array_length(education) <= 5
    );
