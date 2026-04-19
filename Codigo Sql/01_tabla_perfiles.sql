-- Tabla de perfiles (extiende auth.users)

create table perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol text not null check (rol in ('organizador', 'homologador', 'juez')),
  estado boolean default true,
  created_at timestamp default now()
);