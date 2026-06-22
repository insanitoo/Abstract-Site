---
name: O Abstrato Doido stack decisions
description: Key non-obvious decisions for the artist website project — auth, DB, API codegen.
---

## Admin auth
- Session-based auth via `express-session` + bcryptjs. Session secret from `SESSION_SECRET` env var.
- Admin user seeded directly via SQL (bcrypt hash). Username: `admin`, password: `admin123`.
- `logout.mutate(undefined, ...)` — generated mutation expects `void`, not `{}`.

## DB lib rebuild rule
- After adding new table exports to `lib/db/src/schema/`, must run `pnpm run typecheck:libs` before artifact typechecks can see the new exports. Skipping this causes TS2305 "no exported member" in api-server.

**Why:** lib packages are composite and emit declarations; stale `.d.ts` files won't include new exports.

## API hooks
- All hooks from `@workspace/api-client-react`. Generated names: `useListObras`, `useCreateObra`, `useUpdateObra`, `useDeleteObra`, `useListEventos`, `useCreateEvento`, `useUpdateEvento`, `useDeleteEvento`, `useListBlog`, `useCreateBlogPost`, `useUpdateBlogPost`, `useDeleteBlogPost`, `useLogin`, `useLogout`, `useGetMe`, `useGetBlogPost`.
- Query key helpers: `getListObrasQueryKey`, `getListEventosQueryKey`, `getListBlogQueryKey`, `getGetBlogPostQueryKey`, `getGetMeQueryKey`.

## Image assets
- `@assets/image_1782125581457.png` = hero painting (fullscreen hero bg)
- `@assets/image_1782125622268.png` = artist photo (about + sobre sections)
- Vite alias `@assets` → `../../attached_assets` relative to artifact dir.

## WhatsApp contact
- Number hardcoded as `351912345678` in `Galeria.tsx` — update before going live.
