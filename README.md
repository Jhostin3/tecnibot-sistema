# Sistema de Gestión de Competencias de Robótica

Base inicial construida con React, Vite, React Router DOM, Tailwind CSS y
Supabase JS. La autenticación real usa Supabase Auth y la tabla `perfiles`.

## Requisitos

- Node.js
- npm
- Proyecto de Supabase con usuarios creados en Auth.
- Tabla `perfiles` relacionada con `auth.users.id`.

## Configuración local

1. Instalar dependencias:

```bash
npm install
```

2. Crear o completar el archivo `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_CLAVE_ANONIMA=tu-clave-anonima
```

3. Ejecutar el servidor local:

```bash
npm run dev
```

## Rutas iniciales

- `/login`: inicio de sesión público.
- `/panel`: panel privado protegido.

## Flujo de autenticación

1. El usuario ingresa correo y contraseña.
2. Supabase Auth valida las credenciales.
3. El sistema consulta la tabla `perfiles` con el id del usuario autenticado.
4. Si el perfil existe y `estado` es verdadero, se permite el acceso a `/panel`.
5. Si el perfil no existe o está inactivo, se cierra la sesión y se muestra un error.

## Estructura principal

- `src/components`: componentes Atomic Design.
- `src/features/autenticacion`: lógica, servicios, páginas y componentes de autenticación.
- `src/layouts`: layouts públicos y privados.
- `src/routes`: configuración central de rutas.
- `src/lib`: clientes externos, como Supabase.
- `Codigo Sql`: scripts SQL preparados para Supabase.
