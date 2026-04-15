# Quant Engine Admin

Standalone admin dashboard for [ai-realtime-quant-engine](https://github.com/BalanceAiBot/ai-realtime-quant-engine).

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v3
- React Router
- Lucide React (icons)
- Recharts (charts, reserved)

## Quick Start

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

The dashboard expects the quant engine API to be available at `http://localhost:3000`.
You can override this with:

```bash
VITE_API_BASE_URL=http://your-api-url npm run dev
```

## Pages

- **Dashboard** — system summary, KPI cards, recent executions
- **Markets** — runtime control, universe, feature snapshots
- **Trading** — orders, positions, executions, paper order form
- **Risk** — protection statuses
- **Accounts** — Binance account snapshot, user stream control
- **Strategies** — backtest and optimize forms

## Authentication

The admin UI asks for a control token on first load. The token is stored in `sessionStorage` and sent as the `x-control-token` header on every API call.

## Build

```bash
npm run build
```

Static files will be output to `dist/`.

## License

MIT
