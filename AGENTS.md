# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview
- Stack (from `README.md` and code): Next.js App Router + TypeScript, Clerk auth, Cloudinary media transforms/uploads, Prisma ORM with PostgreSQL, Tailwind + DaisyUI.
- Main feature areas:
  - Video upload/compression workflow
  - Video listing and download
  - Social-media image resizing workflow

## Commands used in this repository
- Install dependencies:
  - `npm install`
- Start local development:
  - `npm run dev`
- Build for production:
  - `npm run build`
- Run production server:
  - `npm run start`
- Lint:
  - `npm run lint`

### Database/Prisma commands
- Generate Prisma client after schema changes:
  - `npx prisma generate`
- Create/apply local migration during development:
  - `npx prisma migrate dev --name <migration_name>`
- Apply existing migrations in non-dev environments:
  - `npx prisma migrate deploy`

### Testing status
- There is currently no test runner configured (`package.json` has no `test` script and no test config files are present).
- Single-test execution is not available until a test framework is added.

## High-level architecture
### Routing and layout
- Next.js App Router is used under `app/`.
- Route groups split authenticated app UI and auth pages:
  - `app/(app)/...` contains product pages (`/home`, `/social-share`, `/video-upload`) and uses a client-side shell layout with sidebar/navbar in `app/(app)/layout.tsx`.
  - `app/(auth)/...` contains Clerk-hosted sign-in/sign-up pages.
- Root layout (`app/layout.tsx`) wraps the app in `ClerkProvider`.

### Access control model
- `middleware.ts` enforces route access with Clerk middleware:
  - Public pages: `/`, `/sign-in`, `/sign-up`, `/home`
  - Public API route: `/api/videos`
  - Unauthenticated access to protected pages/APIs is redirected to `/sign-in`.
  - Authenticated users visiting public non-dashboard routes are redirected to `/home`.

### API layer and data flow
- API routes are in `app/api/*/route.ts`.
- `POST /api/video-upload`:
  - Accepts multipart form data (`file`, `title`, `description`, `originalSize`)
  - Uploads/transforms video in Cloudinary
  - Persists metadata to PostgreSQL via Prisma `Video` model
- `GET /api/videos`:
  - Reads video records ordered by `createdAt desc`
- `POST /api/image-upload`:
  - Uploads an image to Cloudinary and returns `publicId`

### Frontend feature flow
- `app/(app)/video-upload/page.tsx` sends upload form data to `/api/video-upload`.
- `app/(app)/home/page.tsx` fetches `/api/videos` and renders `components/VideoCard.tsx`.
- `VideoCard` uses `next-cloudinary` URL builders to generate:
  - Thumbnail images
  - Hover preview video clips
  - Download URL for full video
- `app/(app)/social-share/page.tsx` uploads one image, then applies format-specific transforms via `CldImage`.

### Persistence model
- Prisma schema (`prisma/schema.prisma`) currently defines one core model: `Video`.
- Important fields: `title`, `description`, `publicId`, `originalSize`, `compressedSize`, `duration`, timestamps.
- Migrations are tracked in `prisma/migrations/`.

### Important implementation notes for future edits
- Path alias `@/*` maps to repository root (see `tsconfig.json`).
- API route handlers instantiate `PrismaClient` per file and call `$disconnect()` in `finally`.
- Cloudinary and auth behavior are central to feature flows; changes in upload routes or middleware affect multiple pages.
