# Dev Tool Tracker API

A REST API for tracking AI and developer tool usage across billing cycles. Users register their tools, log current usage as a percentage, and get a recommended daily usage pace to stay within their quota before the next billing reset.

**Live API:** https://dev-tool-tracker-api-production.up.railway.app/api/docs

## Stack

- **NestJS** + **TypeScript** — framework
- **PostgreSQL** + **TypeORM** — database and ORM
- **JWT** + **Passport** — authentication
- **Railway** — deployment and managed database
- **Swagger / OpenAPI** — auto-generated interactive docs

## Features

- JWT authentication — register, login, protected routes
- Per-user tool registry with billing cycle configuration
- Usage logging via percentage snapshots
- Pace calculation endpoint — returns recommended daily usage and on-track status based on days remaining in billing cycle
- Input validation via `class-validator`
- Swagger UI at `/api/docs`

## Endpoints

### Auth

| Method | Path                    | Description              |
| ------ | ----------------------- | ------------------------ |
| POST   | `/api/v1/auth/register` | Register and receive JWT |
| POST   | `/api/v1/auth/login`    | Login and receive JWT    |

### Tools

| Method | Path                | Description     |
| ------ | ------------------- | --------------- |
| POST   | `/api/v1/tools`     | Register a tool |
| GET    | `/api/v1/tools`     | List your tools |
| GET    | `/api/v1/tools/:id` | Get a tool      |
| PUT    | `/api/v1/tools/:id` | Update a tool   |
| DELETE | `/api/v1/tools/:id` | Delete a tool   |

### Usage Logs

| Method | Path                                     | Description            |
| ------ | ---------------------------------------- | ---------------------- |
| POST   | `/api/v1/usage-logs`                     | Log current usage %    |
| GET    | `/api/v1/usage-logs/tool/:toolId`        | All logs for a tool    |
| GET    | `/api/v1/usage-logs/tool/:toolId/latest` | Latest snapshot        |
| GET    | `/api/v1/usage-logs/tool/:toolId/pace`   | Recommended daily pace |

## Pace Logic

`GET /api/v1/usage-logs/tool/:toolId/pace` returns:

```json
{
  "tool_name": "Claude Pro",
  "current_percent": 72,
  "remaining_percent": 28,
  "days_remaining": 9,
  "recommended_daily_pace": 3.11,
  "on_track": false
}
```

`recommended_daily_pace` = remaining quota / days until billing reset. `on_track` flags whether current usage is ahead of the ideal burn rate.

## Local Setup

```bash
cp .env.example .env
# Set DATABASE_URL and JWT_SECRET
npm install
npm run start:dev
# Swagger: http://localhost:3000/api/docs
```

## Environment Variables

| Variable       | Description                   |
| -------------- | ----------------------------- |
| `DATABASE_URL` | PostgreSQL connection string  |
| `JWT_SECRET`   | Secret key for signing JWTs   |
| `NODE_ENV`     | `development` or `production` |
