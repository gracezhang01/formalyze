
create table if not exists "public"."680da8fd0ef55179cf75685a_surveys" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "title" text not null,
  "description" text,
  "status" text not null default 'draft',
  "created_at" timestamptz default now() not null,
  "updated_at" timestamptz default now() not null,

  primary key ("id")
);

create table if not exists "public"."680da8fd0ef55179cf75685a_questions" (
  "id" uuid default gen_random_uuid() not null,
  "survey_id" uuid not null,
  "text" text not null,
  "type" text not null,
  "required" boolean not null default false,
  "options" jsonb,
  "position" integer not null,
  "created_at" timestamptz default now() not null,

  primary key ("id")
);

create table if not exists "public"."680da8fd0ef55179cf75685a_responses" (
  "id" uuid default gen_random_uuid() not null,
  "survey_id" uuid not null,
  "answers" jsonb not null,
  "created_at" timestamptz default now() not null,

  primary key ("id")
);

create table if not exists "public"."680da8fd0ef55179cf75685a_chats" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "title" text not null,
  "created_at" timestamptz default now() not null,

  primary key ("id")
);

create table if not exists "public"."680da8fd0ef55179cf75685a_messages" (
  "id" uuid default gen_random_uuid() not null,
  "chat_id" uuid not null,
  "role" text not null,
  "content" text not null,
  "created_at" timestamptz default now() not null,

  primary key ("id")
);
  