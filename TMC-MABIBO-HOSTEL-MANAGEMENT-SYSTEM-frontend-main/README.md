# TUCASA Mabibo Hostel — Management System Frontend

React 18 + TypeScript + Vite frontend for the TUCASA Mabibo Hostel management
system. Consumes a Spring Boot REST API at `http://localhost:8080` and a
WebSocket endpoint at `http://localhost:8080/ws` for live chat.

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` (open this URL in your browser). Make sure the Spring Boot backend is
running on `http://localhost:8080` (update `BASE_URL` in
`src/api/client.ts` and `WS_URL` in `src/hooks/useWebSocket.ts` if your
backend runs elsewhere).

## Notes on this build

- **UI components**: `src/components/ui/*` are hand-written, Tailwind-based
  primitives styled to match shadcn/ui's API (Button, Card, Input, Select,
  Checkbox, Badge, Dialog, Skeleton). This avoids depending on the shadcn CLI
  network install; if you'd rather use the real shadcn/ui generator, run
  `npx shadcn@latest init` and `npx shadcn@latest add button card input ...`
  and these files can be swapped in directly since the import paths match.
- **Auth**: JWT is stored in `localStorage` under `tucasa_token` /
  `tucasa_user`. The Axios interceptor in `src/api/client.ts` attaches it to
  every request and forces a logout + redirect to `/login` on any 401.
- **Role-based UI**: `useAuth().user.role` (`MEMBER` / `LEADER` / `ADMIN`)
  drives what's shown — see `Dashboard.tsx`, `Navbar.tsx`, `BottomNav.tsx`,
  and the `adminOnly` flag on `ProtectedRoute` in `App.tsx`.
- **Endpoints**: all API calls live in `src/api/endpoints/` and are typed
  against `src/types/index.ts`. Adjust paths there if your backend's routes
  differ from the ones assumed here (see each file for the exact endpoint
  list).
- **Chat**: `src/hooks/useWebSocket.ts` connects via SockJS + STOMP,
  subscribes to `/topic/public`, and publishes to `/app/chat.send`. Adjust
  destinations to match your backend's `@MessageMapping` /
  `@SendTo` configuration.

## Project structure

See the brief — this mirrors it exactly:

```
src/
├── api/{client.ts, endpoints/{auth,member,admin}.ts}
├── components/{ui, shared, modals}
├── contexts/AuthContext.tsx
├── hooks/{useAuth.ts, useWebSocket.ts}
├── pages/{Login,Register,Dashboard,UpdateSemester,Chat,Materials,Profile}.tsx
├── pages/admin/{AdminPanel,AlumniSearch,UserManagement}.tsx
├── types/index.ts
├── utils/{validators.ts, cn.ts}
├── App.tsx, main.tsx, index.css
```
