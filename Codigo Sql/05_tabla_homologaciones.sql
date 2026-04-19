create table homologaciones (
  id uuid primary key default gen_random_uuid(),

  equipo_id uuid references equipos(id) on delete cascade,
  homologador_id uuid references perfiles(id),

  estado text not null
    check (estado in ('aprobado', 'rechazado')),

  observacion text,
  fecha timestamp default now()
);