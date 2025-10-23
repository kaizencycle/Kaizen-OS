-- users, sessions, xp_events, attestations, rewards
create table if not exists users (
  id              uuid primary key default gen_random_uuid(),
  handle          text unique not null,
  email_hash      text unique,
  wallet          text unique,
  reputation      integer not null default 50,
  created_at      timestamptz not null default now()
);

create table if not exists sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  mentors_used    text[] not null default '{}',
  total_xp        integer not null default 0,
  level           integer not null default 1,
  started_at      timestamptz not null default now(),
  ended_at        timestamptz
);

create index if not exists sessions_user_idx on sessions(user_id);

create table if not exists xp_events (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  session_id      uuid not null references sessions(id) on delete cascade,
  rubric_hash     text not null,
  xp              integer not null,
  reason          text not null,
  created_at      timestamptz not null default now()
);

create index if not exists xp_events_user_idx on xp_events(user_id);
create index if not exists xp_events_session_idx on xp_events(session_id);

create table if not exists attestations (
  id              uuid primary key default gen_random_uuid(),
  attestation_id  text unique not null,
  user_id         uuid not null references users(id) on delete cascade,
  session_id      uuid not null references sessions(id) on delete cascade,
  mentors_used    text[] not null,
  rubric_json     jsonb not null,
  xp_awarded      integer not null,
  gi_snapshot     numeric(4,3) not null,
  merkle_root     text not null,
  sig             text not null,
  created_at      timestamptz not null default now()
);

create index if not exists attestations_user_idx on attestations(user_id);
create index if not exists attestations_session_idx on attestations(session_id);

create table if not exists rewards (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  attestation_id  text not null,
  level_before    integer not null,
  level_after     integer not null,
  amount_gic      numeric(16,6) not null,
  tx_id           text unique,
  status          text not null default 'pending',
  created_at      timestamptz not null default now()
);

-- convenience function for hashing emails (optional)
create extension if not exists pgcrypto;
