create table enfrentamientos (
  id uuid primary key default gen_random_uuid(),

  subcategoria_id uuid references subcategorias(id),

  ronda text not null
    check (ronda in ('cuartos', 'semifinal', 'final')),

  equipo_a_id uuid references equipos(id),
  equipo_b_id uuid references equipos(id),

  ganador_id uuid references equipos(id),

  estado text default 'pendiente'
    check (estado in ('pendiente', 'en_curso', 'finalizado')),

  created_at timestamp default now()
);