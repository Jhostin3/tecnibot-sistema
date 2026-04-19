-- Tabla de equipos participantes.
-- Pendiente de definir antes de ejecutar en Supabase.
create table equipos (
  id uuid primary key default gen_random_uuid(),

  nombre_equipo text not null,
  nombre_robot text,
  representante text not null,
  institucion text not null,
  correo text,

  subcategoria_id uuid references subcategorias(id),

  estado_inscripcion text default 'pendiente'
    check (estado_inscripcion in ('pendiente', 'validado')),

  estado_homologacion text default 'pendiente'
    check (estado_homologacion in ('pendiente', 'aprobado', 'rechazado')),

  observaciones text,

  created_at timestamp default now()
);