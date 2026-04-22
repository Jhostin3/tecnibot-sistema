create table if not exists sorteo (
  id uuid primary key default gen_random_uuid(),

  subcategoria_id uuid not null references subcategorias(id) on delete cascade,
  equipo_id uuid not null references equipos(id) on delete cascade,
  numero_bola integer not null check (numero_bola >= 1),
  registrado_por uuid references perfiles(id),
  fecha timestamp default now(),

  constraint sorteo_subcategoria_numero_bola_unique unique (subcategoria_id, numero_bola),
  constraint sorteo_subcategoria_equipo_unique unique (subcategoria_id, equipo_id)
);

create index if not exists idx_sorteo_subcategoria_id on sorteo(subcategoria_id);
create index if not exists idx_sorteo_equipo_id on sorteo(equipo_id);
