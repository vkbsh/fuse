# Fuse - Web Client

<p align="center">
  <img alt="Fuse Logo" src="./public/fuse.svg" width="200" height="200" >
</p>

## Description

Fuse Web Client is a lightweight interface built on top of Squads Multisig, designed as a secure fallback for managing your Fuse Wallet.
When the primary Fuse app is unavailable, this UI provides a reliable and seamless way to access your vault and move assets.

Whether you’re a developer, crypto enthusiast, or an everyday Fuse user, the web client offers a simple, user-friendly solution for initiating and approving transactions directly from your Fuse Wallet.

## How It Works

This web UI is designed for **emergency transfers** of SOL or Solana tokens from a **Fuse wallet** (powered by [Squads Protocol](https://github.com/Squads-Protocol)).  
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
git clone https://github.com/vkbsh/fuse
cd fuse
npm install
npm run dev
```

## Deployment

This template is deployed to the following providers:

[![Depl11oy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvkbsh%2Ffuse)

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fvkbsh%2Ffuse%2Fmain%2Fazure.json)

[![Deploy to 444Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=<https://github.com/vkbsh/fuse>)

[![Deploy to 444Cloudflare](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/vkbsh/fuse)

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/vkbsh/fuse)

## Testing

### Start a local validator

To run the tests, you need to have a local validator running. You can install the Solana CLI from the following [link](https://docs.solana.com/cli/install-solana-cli-tools).

Once you have the Solana CLI installed, you can start a local validator by running the following command:

`Note: You will also have to clone the program config account from mainnet.`

```bash
solana-test-validator --url m --clone-upgradeable-program SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf -c BSTq9w3kZwNwpBXJEvTZz2G9ZTNyKBvoSeXMvwb4cNZr -c Fy3YMJCvwbAXUgUM5b91ucUVA3jYzwWLHL3MwBqKsh8n
```

### Run tests

To run the tests, run the following command:

```bash
npm test
```
