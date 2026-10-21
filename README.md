# Paper Trading Desk

Open it at **https://kphudsond.github.io/paper-trading-desk/**

A single web page that runs a Claude trading agent against an Alpaca **paper** (simulated money) account. It's built for Safari on an iPad, and also works on a phone or a computer.

## How it works

1. You write your strategy in plain English on the **Rules & limits** tab. An example trend-following rule is included.
2. Tap **Run agent**. Claude reads the account, holdings and prices through five narrow tools, then proposes orders. It can't place orders itself.
3. Code on the page checks every proposal against your hard limits:
   - allowed funds only
   - no short selling
   - no borrowing (margin)
   - largest holding and largest buy caps
   - cash reserve
   - a stop on buying after a daily drop
   - orders per day and proposals per run
   - a trading on/off switch
4. You approve or reject each order. Approved orders are checked again against fresh prices and balances just before they're sent. Sells go first.
5. Everything is recorded on the **Log** tab, including Claude's reasoning, every check, fills and tokens used.

The app only talks to Alpaca's paper service, so it can't reach a live account. Going live would need a deliberate code change, and that change isn't offered here.

## Set-up

1. **Host the page.** `index.html` is the whole app. Put it on any https static host, such as GitHub Pages, Netlify or Cloudflare Pages.
2. **Open it on the iPad in Safari**, tap Share, then **Add to Home Screen**. It opens like an app and keeps its settings.
3. **Try the demo.** With no keys, it runs on simulated data with a scripted walk-through of the example rule.
4. **Alpaca:** sign up at alpaca.markets, switch to the Paper account, and generate an API key pair. Paste the Key ID and Secret into **Settings**.
5. **Claude:** create an API key at console.anthropic.com and paste it into **Settings**. API use is billed per token, separately from a Claude subscription. The default model is `claude-sonnet-5-5`.
6. Tap **Check connections** in Settings.

## If market data won't connect

Alpaca has documented browser access for its trading service. I couldn't confirm the same for its market-data service. If the connection check fails for market data only:

1. Create a free Cloudflare Worker.
2. Paste in `relay-worker.js` and set `ALLOWED_ORIGIN` to the address you open the app from.
3. Deploy, then paste the worker's address into **Settings → Relay address**.

The relay stores nothing and only reaches Alpaca's paper and market-data services.

## Running it from Brisbane

- US market hours in Brisbane time:
  - until 1 November 2026: about 11:30 pm to 6:00 am
  - after the US clocks go back: 12:30 am to 7:00 am
- Orders sent while the market is closed wait and fill at the next open. If you'd rather block that, tick **Only send orders while the US market is open**.
- The agent runs only when you tap Run. An iPad web app can't trade in the background.

## Where things are stored

Keys, rules and the log are kept in Safari's storage on that device only. They're never sent to Claude. Clearing Safari's website data removes them. Use **Export log** to keep a copy.

## Files

- `index.html` is the app.
- `relay-worker.js` is the optional market-data relay (see above).

This is a prototype for paper trading and isn't financial advice.
