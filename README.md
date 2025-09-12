<p align="center" style="margin: 0 auto;">
  <img src="public/fuse.png" alt="Fuse Logo" width="256" height="256" />
</p>

<h1 align="center">Fuse - Web Client</h1>

<p align="center">
  A secure, lightweight web interface for <a href="https://fusewallet.com/" target="_blank">Fuse - Solana Smart Wallet</a>.  
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License"></a>
</p>

## Overview

The **Fuse Web Client** is designed as a **secure emergency UI** for managing your Fuse Wallet.  
When the primary Fuse app is unavailable, this web interface ensures uninterrupted access to your vault, allowing you to **transfer SOL and tokens** safely.

- 🔒 Secure, multisig-protected
- 🖥️ Minimal & intuitive UI
- ⚡ Built on [Squads Protocol](https://github.com/Squads-Protocol)
- 🌍 Deploy anywhere (AWS, GCP, Vercel, Cloudflare, Netlify, Docker, etc.)

## How It Works

This web UI is designed for **emergency transfers** from a **Fuse wallet** (powered by [Squads Protocol](https://github.com/Squads-Protocol)).  
The flow follows the default **threshold = 2** setup in Fuse.

---

### 1. Connect Wallet

- Log in with your Fuse-associated wallet (**Cloud key** or **Recovery key**).
- The **Cloud key** wallet is required to initiate transactions.

---

### 2. Select Token & Withdraw

- From the dashboard, choose the token (SOL or SPL token) you want to transfer.
- Create a withdrawal transaction.

---

### 3. Approvals (Threshold = 2)

- Transactions require **two approvals** in Fuse:
  1. **Cloud key** → Initiates the transaction
  2. **Recovery key** → Approves the transaction
  3. **Cloud key** → Executes the transaction

```text
+-----------+        +-----------+        +-----------+          +------------------+
| Cloud Key |        | Recovery  |        |   Fuse    |          |   Destination    |
+-----+-----+        +-----+-----+        +------+----+          +--------+---------+
      |                    |                     |                        |
      |     Initiate Tx    |                     |                        |
      |------------------->|                     |                        |
      |                    |     Approve Tx      |                        |
      |<-------------------|-------------------->|                        |
      |                    |                     |                        |
      |     Execute Tx     |                     |                        |
      |<-------------------|-------------------->|                        |
      |                    |                     |     Transfer Funds     |
      |                    |                     |----------------------->|
      |                    |                     |                        |
+-----+-----+        +-----+-----+        +------+----+          +--------+---------+
| Cloud Key |        | Recovery  |        |   Fuse    |          |    Destination   |
+-----------+        +-----------+        +-----------+          +------------------+
```

## Run locally

```bash
git clone https://github.com/vkbsh/fuse && cd fuse
```

```bash
npm install
```

```bash
npm run dev
```

## Deployment

### Cloud Providers

Try deploying to the following providers:

[Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvkbsh%2Ffuse)

[Azure](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fvkbsh%2Ffuse%2Fmain%2Fazure.json)

[Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/vkbsh/fuse)

[Cloudflare](https://deploy.workers.cloudflare.com/?url=<https://github.com/vkbsh/fuse>)

[DigitalOcean](https://cloud.digitalocean.com/apps/new?repo=https://github.com/vkbsh/fuse)

### Docker

or you can use Docker:

```bash
docker build -t fuse .
```

```bash
docker run -p 80:80 fuse
```

## Testing

### Start a local validator

To run the tests, you need to have a local validator running. You can install the Solana CLI from the following [link](https://docs.solana.com/cli/install-solana-cli-tools).

Once you have the Solana CLI installed, you can start a local validator by running the following command:

```bash
npm run validator
```

### Run tests

```bash
npm run test:program
```

```bash
npm run test:browser
```
