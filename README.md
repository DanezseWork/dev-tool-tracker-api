# Dev Tool Tracker API

NestJS + PostgreSQL REST API for tracking AI/dev tool usage across billing cycles.

## Stack
- **NestJS** — framework
- **TypeORM** + **PostgreSQL** — database
- **Railway** — deployment
- **Swagger** — auto-generated docs at `/docs`

## Endpoints

### Tools
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/tools` | Register a tool |
| GET | `/api/v1/tools` | List all tools |
| GET | `/api/v1/tools/:id` | Get tool by ID |
| PUT | `/api/v1/tools/:id` | Update tool |
| DELETE | `/api/v1/tools/:id` | Delete tool |

### Usage Logs
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/usage-logs` | Log current usage % |
| GET | `/api/v1/usage-logs/tool/:toolId` | All logs for a tool |
| GET | `/api/v1/usage-logs/tool/:toolId/latest` | Latest usage snapshot |
| GET | `/api/v1/usage-logs/tool/:toolId/pace` | Recommended daily pace |

## Local Setup

```bash
cp .env.example .env
# Fill in DATABASE_URL
npm install
npm run start:dev
```

## Deploy to Railway

1. Push to GitHub
2. New project → Deploy from GitHub repo
3. Add a PostgreSQL service
4. Set `DATABASE_URL` env var (Railway auto-injects if linked)
5. Set `NODE_ENV=production`

## Pace Logic

`GET /usage-logs/tool/:id/pace` returns:
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
