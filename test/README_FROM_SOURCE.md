# Esuyo Gateway

A complete platform for routing, monitoring, and analysing LLM API usage across multiple providers. Consists of two applications:

Application Description Port

**[Gateway](./gateway/)**

Multi-provider LLM gateway with auth, logging, cost tracking, rate limiting, and alerts

`:3000`

**[Dashboard](./dashboard/)**

Real-time analytics UI with charts, user drill-downs, raw logs, and CSV export

`:3001`

## Architecture

Client apps (your services)

│

▼

┌───────────────┐ ┌───────────────┐

│ LLM Gateway │────▶│ AI Providers │

│ (Hono :3000) │ │ OpenAI │

│ │◀────│ Anthropic │

│ - Auth │ │ OpenRouter │

│ - Rate limit │ │ Ollama │

│ - Cost calc │ └───────────────┘

│ - Alerts │

└───────┬───────┘

│ writes

▼

┌───────────────┐ ┌───────────────┐

│ PostgreSQL │◀────│ Dashboard │

│ (usage\_logs) │ │ (Next.js) │

└───────────────┘ └───────────────┘

## Development

> **Docker is for production only.** During development, run each app directly with `npm run dev` — no containers needed.

### Local development

\# 1. Start PostgreSQL locally (e.g. via Docker or a managed instance)

\# The apps connect to it via DATABASE\_URL in their .env files

  

\# 2. Configure environment files

cp gateway/.env.example gateway/.env

cp dashboard/.env.example dashboard/.env

\# Edit both .env files with your API keys, DATABASE\_URL, and secrets

  

\# 3. Start the Gateway (terminal 1)

cd gateway && npm ci && npm run dev # → http://localhost:3000

  

\# 4. Start the Dashboard (terminal 2)

cd dashboard && npm ci && npm run dev # → http://localhost:3001

  

\# 5. Create your first API key

curl http://localhost:3000/admin/keys \\

\-H "Authorization: Bearer $ADMIN\_API\_KEY" \\

\-H "Content-Type: application/json" \\

\-d '{"user\_id": "my-app", "provider": "openai", "label": "Main app"}'

  

\# 6. Open the dashboard at http://localhost:3001

### Production deployment

For production, use Docker Compose:

docker compose up --build -d

## Features

1.  **Multi-provider** — OpenAI, Anthropic, OpenRouter, Ollama + any OpenAI-compatible endpoint. New providers added via YAML config, no code changes needed.
2.  **Usage logging** — Every request logged to PostgreSQL + JSONL files
3.  **Cost tracking** — Automatic cost estimation per request with configurable pricing
4.  **Rate limiting** — Sliding-window rate limiter with per-user limits
5.  **Alerts** — Threshold-based alerts for spend, tokens, and error rates with webhook support
6.  **Analytics dashboard** — Real-time charts, user drill-downs, model breakdowns, raw logs
7.  **CSV export** — Download filtered usage data
8.  **OIDC/SSO** — Optional SSO login for the dashboard
9.  **Auto-migrations** — Database schema applied on startup
10.  **Admin seeding** — Admin user created automatically from env vars

## Documentation

See each application's README for detailed documentation:

1.  [Gateway README](./gateway/README.md) — API reference, environment variables, provider config, production deployment
2.  [Dashboard README](./dashboard/README.md) — Pages, API routes, design system, authentication, production deployment

## Tech stack

Layer Technology

Gateway framework

[Hono](https://hono.dev/) + `@hono/node-server`

Dashboard framework

[Next.js 15](https://nextjs.org/) (App Router)

UI components

React 19 + [Tailwind CSS](https://tailwindcss.com/)

Charts

[Recharts](https://recharts.org/)

Database

PostgreSQL 17 + [Drizzle ORM](https://orm.drizzle.team/)

Auth (dashboard)

[NextAuth.js](https://next-auth.js/) v4

Testing

[Vitest](https://vitest.dev/)

Containerisation

Docker + Docker Compose