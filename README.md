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
- Per-user tool registry with flexible billing cycle configuration (monthly, weekly, custom)
- Usage logging via percentage snapshots
- Pace calculation endpoint — returns fractional days remaining, recommended daily usage pace, and on-track status
- Time-of-day reset support — set `cycle_reset_time` in UTC for accurate sub-day pacing
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

## Cycle Types

Each tool has a `cycle_type` that controls how the billing period is calculated:

| `cycle_type` | Required fields | Description |
| ------------ | --------------- | ----------- |
| `monthly` (default) | `billing_reset_day` (1–31) | Resets on a fixed day of the month |
| `weekly` | `cycle_start_date` | 7-day cycle anchored to a start date |
| `custom` | `cycle_start_date`, `cycle_length_days` | N-day cycle anchored to a start date |

### Reset Time

All cycle types support an optional `cycle_reset_time` field (UTC, `HH:MM` or `HH:MM:SS`). When set, the cycle is considered to start and end at that time of day rather than midnight.

> **Note:** Most AI tools do not reset at midnight UTC. Check your provider's billing timezone and set `cycle_reset_time` explicitly for accurate pace calculations. When omitted, the pace response includes `"reset_time_assumed": true` so your client can surface a warning.

## Pace Logic

`GET /api/v1/usage-logs/tool/:toolId/pace` returns:

```json
{
  "tool_name": "Claude Pro",
  "current_percent": 72,
  "remaining_percent": 28,
  "days_elapsed": 21.5,
  "days_remaining": 8.75,
  "recommended_daily_pace": 3.2,
  "on_track": false,
  "reset_time_assumed": true
}
```

- `days_elapsed` / `days_remaining` — fractional, based on exact UTC timestamps
- `recommended_daily_pace` — remaining quota divided by days remaining
- `on_track` — `true` if current usage is at or below the ideal linear burn rate for this point in the cycle
- `reset_time_assumed` — `true` when `cycle_reset_time` was not set and midnight UTC was used

## Database Migrations

The project includes TypeORM migration files in `src/migrations/`. To run them against a live database:

```bash
npx ts-node -r tsconfig-paths/register ./node_modules/.bin/typeorm migration:run -d src/data-source.ts
```

Schema auto-sync (`synchronize: true`) is enabled in development and disabled in production, where migrations must be run explicitly.

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
