# TUCASA Management System Backend — Mabibo Hostel Branch (UDSM)

Spring Boot 3.3 / Java 21 backend for the TUCASA Mabibo Hostel branch. Serves
a React frontend via REST + STOMP/WebSocket.

## Stack

Java 21 · Spring Boot 3.3.4 · Spring Security 6 (stateless JWT) · Spring Data
JPA (Hibernate) · PostgreSQL 16 · Flyway · Spring WebSocket (STOMP) · Maven

## 1. Prerequisites

- JDK 21
- Maven 3.9+
- PostgreSQL 16 running locally (or reachable)

## 2. Database setup

The repository includes a PostgreSQL 16 Compose service matching the default
application settings. Start it with:

```bash
docker compose up -d postgres
```

To use an existing PostgreSQL installation instead, create the database and
user manually as shown below.

```bash
createdb tucasa_mabibo
createuser tucasa_user --pwprompt   # set a password, matches DB_PASSWORD below
```

Flyway runs automatically on application startup and creates the schema
(`V1`), seeds the 31 Tanzanian regions + Mabibo Hostel branch + a default
active semester + an admin account (`V2`), and adds performance indexes
(`V3`). No manual DDL is required.

## 3. Configuration

All settings are environment-variable driven with sane local defaults (see
`src/main/resources/application.properties`). At minimum, set:

```bash
export DB_URL=jdbc:postgresql://localhost:5433/tucasa_mabibo
export DB_USERNAME=tucasa_user
export DB_PASSWORD=your_db_password
export JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')   # generate a real secret for anything beyond local dev
```

`JWT_SECRET` must be a base64-encoded string at least 512 bits long for the
HS512 signer used by `JwtUtil`. The value baked into
`application.properties` is a placeholder for local development only —
**always override it** outside of a laptop-only demo.

## 4. Run

```bash
mvn spring-boot:run
```

The API listens on `http://localhost:8080` by default.

## 5. Default admin account

Seeded by `V2__seed_reference_data.sql`:

- Email: `admin@tucasa.org`
- Password: `Admin@123`

**Change this password immediately** in any environment beyond a local demo
— there is no forced-rotation mechanism built in, so this is a manual step.

## 6. Key business rules enforced server-side

| Rule | Where |
|---|---|
| Role inheritance (LEADER/ADMIN are also MEMBER) | `User.getAuthorities()`, `SecurityConfig` |
| Semester update touches only `yearOfStudy`, `phone`, `talent` | `SemesterUpdateRequest` DTO shape + `MemberService.updateSemesterDetails` |
| Baptism is one-way (false→true only), ADMIN-only, audited | `AdminService.baptizeMember`, `baptism_audit_log` (DB CHECK constraint + service check) |
| Graduation copies a snapshot to `alumni_records`, sets status ALUMNI | `AdminService.graduateMember` |
| Alumni cannot perform semester updates | `MemberService.updateSemesterDetails` |
| Active-member count, branch-filterable, cached | `LeaderService.getActiveMembersCount` (`@Cacheable`, Caffeine) |

## 7. WebSocket / STOMP chat

- Endpoint: `ws://localhost:8080/ws` (SockJS-wrapped)
- App prefix: `/app` — client sends to `/app/chat.sendMessage`
- Broker: `/topic` — server broadcasts to `/topic/public`
- Auth: the STOMP `CONNECT` frame must include a native header
  `Authorization: Bearer <accessToken>` (same access token used for REST).
  See `StompAuthChannelInterceptor`.

## 8. API surface

See the controllers in `controller/` for the full endpoint list:
`AuthController` (public), `MemberController` + `ContentController`
(any authenticated member), `LeaderController` (LEADER/ADMIN),
`AdminController` (ADMIN only), `ChatController` (STOMP).

## 9. Known gaps / next steps for a real production rollout

- `EmailService` is a mock (logs instead of sending); wire in
  `JavaMailSender` and flip `app.mail.enabled=true` when ready.
- `AdminService.getDashboardStats` leaves `baptizedCount` and
  `membersByYear` as placeholders — add the corresponding repository
  queries when the dashboard UI needs them.
- No refresh-token revocation/blacklist store — refresh tokens are valid
  until expiry even after a password change. Add a token-version or
  denylist table if you need immediate revocation.
- No integration tests included; the `pom.xml` already pulls in
  `spring-boot-starter-test`, `spring-security-test`, and H2 for that
  purpose.
