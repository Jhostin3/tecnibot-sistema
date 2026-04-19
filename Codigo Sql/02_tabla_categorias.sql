create table categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null
);