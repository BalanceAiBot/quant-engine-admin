# Quant Engine Admin

Standalone admin dashboard for [ai-realtime-quant-engine](https://github.com/BalanceAiBot/ai-realtime-quant-engine).

## Stack

- Vanilla HTML5
- Tailwind CSS (CDN)
- Vanilla ES Modules

## Quick Start

Open `index.html` directly in a browser, or serve it with any static file server:

```bash
npx serve .
```

Then open `http://localhost:3001` (or whatever port the server uses).

The dashboard expects the quant engine API to be available at `http://localhost:3000`.

## Pages

- **Dashboard** — system summary, KPI cards, recent executions
- **Markets** — runtime control, universe, feature snapshots
- **Trading** — orders, positions, executions, paper order form
- **Risk** — protection statuses
- **Accounts** — Binance account snapshot, user stream control
- **Strategies** — backtest and optimize forms

## Authentication

The admin UI asks for a control token on first load. The token is stored in `sessionStorage` and sent as the `x-control-token` header on every API call.

## License

MIT
