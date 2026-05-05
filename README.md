# Saiya Gym

App de gestión de gimnasio **local-first**: React + Vite + Tailwind v4 contra Supabase (PostgreSQL) corriendo en Docker vía **OrbStack**.

---

## Pre-requisitos

- **Node.js 18+** y `npm`
- **[OrbStack](https://orbstack.dev/)** instalado (provee el motor de Docker en macOS)
- **[Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)** (`brew install supabase/tap/supabase`)
- Archivo `.env.local` en la raíz con las llaves del entorno local:

  ```bash
  VITE_SUPABASE_URL="http://127.0.0.1:54321"
  VITE_SUPABASE_ANON_KEY="<tu-anon-key-local>"
  ```

  > Después de `npm run db:start` por primera vez, la `anon key` se imprime en la terminal o puedes obtenerla con `npm run db:status`.

---

## Instalación (una sola vez)

```bash
npm install
```

---

## Cómo levantar el entorno (3 ventanas)

El flujo completo necesita **tres ventanas** corriendo en paralelo. Cada una tiene una responsabilidad clara:

### 🟠 Ventana 1 — OrbStack (motor de Docker)

Abre la app de **OrbStack** y déjala corriendo. No hay comando que ejecutar; basta con que el ícono esté activo en la barra de menú. Si OrbStack no está abierto, los siguientes pasos fallarán con `Cannot connect to the Docker daemon`.

> 💡 Verifica que esté listo con: `docker ps` (debe responder sin error).

### 🟢 Ventana 2 — Base de datos (Supabase local)

```bash
npm run db:start
```

Levanta los contenedores de PostgreSQL, PostgREST, Auth, Studio, etc. Cuando termine verás un resumen con las URLs y llaves locales. Deja esta terminal abierta para correr comandos `db:*` cuando los necesites:

| Comando | Para qué sirve |
|---|---|
| `npm run db:status` | Ver qué contenedores están arriba y sus URLs |
| `npm run db:stop` | Apagar todo el stack al terminar el día |
| `npm run db:restart` | Reinicio limpio cuando algo se traba |
| `npm run db:diff` | Generar migración nueva desde cambios locales |
| `npm run db:pull` / `db:push` | Sincronizar esquema con el remoto |

> 🔍 **Supabase Studio** queda en `http://127.0.0.1:54323` para inspeccionar datos.

### 🔵 Ventana 3 — Frontend (Vite)

```bash
npm run dev
```

Arranca el servidor de desarrollo en `http://localhost:5173` con HMR. Esta terminal mostrará logs de Vite y errores de compilación en vivo.

---

## Para apagar todo

1. `Ctrl+C` en la ventana de Vite.
2. `npm run db:stop` en la ventana de la base de datos.
3. (Opcional) Cerrar OrbStack desde la barra de menú.

---

## Otros comandos útiles

| Comando | Descripción |
|---|---|
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | ESLint (falla con cualquier warning) |

---

## Estructura clave

```
src/
  supabase.js              ← Cliente único de Supabase
  components/              ← Componentes React (consumen supabase directo)
supabase/
  migrations/              ← Esquema versionado (no editar migraciones aplicadas)
  seed.sql                 ← Datos demo que se cargan al hacer db:start
  DB_SCHEMA.md             ← Diccionario de datos (leer antes de tocar el esquema)
.agents/skills/            ← Roles/skills del proyecto (arquitecto, guardián, etc.)
CLAUDE.md                  ← Guía para Claude Code
```

---

## Troubleshooting rápido

- **`Cannot connect to the Docker daemon`** → OrbStack no está corriendo.
- **El frontend muestra "Error de conexión"** → Corre `npm run db:status`; si no hay contenedores arriba, `npm run db:start`.
- **Cambié el esquema y la app no lo ve** → ¿Generaste migración con `npm run db:diff` y reiniciaste con `npm run db:restart`?
- **Puerto 54321/5173 ocupado** → `npm run db:stop` o mata el proceso en el puerto antes de relanzar.
