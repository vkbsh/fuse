# Fuse - Web Client

![Fuse](./public/images/SDNA-fuse.jpg)

## Deployment

This template is deployed to the following providers:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvkbsh%2Ffuse)

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
