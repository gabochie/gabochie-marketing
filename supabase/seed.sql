-- Gabochie Marketing — Seed Data
-- Run after migrations in Supabase SQL Editor

-- ── Message Templates ──
insert into message_templates (name, body) values
  ('day1',    'Hello {name}, I was looking up {type} businesses in {area} and came across {biz}. I noticed {gbpObservation} I help businesses become visible on Google Maps. If useful, I can do a free audit for you.'),
  ('day3',    'Hello {name}, following up on {biz}. I checked again and noticed {gbpObservation} I can help fix that. Would you be open to a quick chat?'),
  ('day7',    'Hello {name}, if we start now I can get {biz} visible on Google Maps within 48 hours. If it does not show up as agreed, you do not pay. Can I start today?'),
  ('network', 'Hello {name}, hope you are doing well. I have been helping Ghana businesses improve how they show up on Google Maps, and when I looked at {biz} I noticed {gbpObservation} If useful, message me and I will show you what I recommend.')
on conflict (name) do nothing;

-- ── Initial Admin User ──
insert into admin_users (email, display_name) values
  ('gabochiemarketing@gmail.com', 'Gabochie Admin')
on conflict (email) do nothing;
