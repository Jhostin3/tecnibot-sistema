create table resultados (
  id uuid primary key default gen_random_uuid(),

  enfrentamiento_id uuid references enfrentamientos(id) on delete cascade,
  juez_id uuid references perfiles(id),

  goles_a integer not null,
  goles_b integer not null,

  observacion text,
  fecha timestamp default now()
);