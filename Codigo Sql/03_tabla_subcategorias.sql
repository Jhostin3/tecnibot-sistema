-- Tabla de subcategorías asociadas a categorías.
-- Pendiente de definir antes de ejecutar en Supabase.
create table subcategorias (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid references categorias(id) on delete cascade,
  nombre text not null
);
