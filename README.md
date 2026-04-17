# Sistema de Gestión de Competencias de Robótica

Base inicial construida con React, Vite, React Router DOM, Tailwind CSS y
Supabase JS. Esta primera etapa prepara el módulo de inicio de sesión, el panel
privado y una arquitectura escalable con Atomic Design.

## Requisitos

- Node.js
- npm

## Configuración local

1. Instalar dependencias:

```bash
npm install
```

2. Crear el archivo de entorno:

```bash
cp .env.example .env
```

3. Completar las variables de Supabase cuando el proyecto real esté creado:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_CLAVE_ANONIMA=tu-clave-anonima
```

4. Ejecutar el servidor local:

```bash
npm run dev
```

## Rutas iniciales

- `/login`: inicio de sesión público.
- `/panel`: panel privado protegido.

## Estructura principal

- `src/components`: componentes Atomic Design.
- `src/features/autenticacion`: lógica, servicios, páginas y componentes de autenticación.
- `src/layouts`: layouts públicos y privados.
- `src/routes`: configuración central de rutas.
- `src/lib`: clientes externos, como Supabase.
- `Codigo Sql`: scripts SQL preparados para Supabase.
