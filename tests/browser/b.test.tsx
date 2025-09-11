import { render } from "vitest-browser-react";
import { page } from "@vitest/browser/context";
import { beforeAll, describe, expect, test, vi } from "vitest";

import {
  TOKEN_PROGRAM_ADDRESS,
  TOKEN_2022_PROGRAM_ADDRESS,
} from "gill/programs";
import { type Address } from "gill";

import App from "~/App";
import WithQueryProvider from "~/components/WithQueryProvider";

import { useWalletStore } from "~/state/wallet";
import { SOL_MINT_ADDRESS } from "~/program/multisig/address";

import {
  createMintAndMintTo,
  getTestAccountsWithBalances,
} from "../program/utils";

const walletNameTest1 = "UserWallet1";
const walletNameTest2 = "UserWallet2";

vi.mock("~/components/AutoReconnectWallet", () => ({
  default: () => null,
}));

vi.mock("~/hooks/wallet", () => ({
  useWalletByName: (name: string) => ({
    chains: ["solana:mainnet"],
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Zy8+PC9zdmc+ ",
    name,
    version: "1.0.0",
    features: ["solana:signAndSendTransaction"],
    accounts: [
      {
        address:
          name === walletNameTest1 ? creator.address : secondMember.address,
        chains: ["solana:mainnet"],
        /** Public key of the account, corresponding with a secret key to use. */
        publicKey:
          name === walletNameTest1 ? creator.address : secondMember.address,
      },
    ],
  }),
  SOLANA_SIGN_AND_SEND_TRANSACTION_FEATURE: "solana:signAndSendTransaction",
  useSupportedWallets: () => [
    {
      chains: ["solana:mainnet"],
      icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Zy8+PC9zdmc+ ",
      name: walletNameTest1,
      version: "1.0.0",
      features: ["solana:signAndSendTransaction"],
      accounts: [
        {
          address: creator.address,
          chains: ["solana:mainnet"],
          /** Public key of the account, corresponding with a secret key to use. */
          publicKey: creator.address,
        },
      ],
    },
    {
      chains: ["solana:mainnet"],
      icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Zy8+PC9zdmc+ ",
      name: walletNameTest2,
      version: "1.0.0",
      features: ["solana:signAndSendTransaction"],
      accounts: [
        {
          address: secondMember.address,
          chains: ["solana:mainnet"],
          /** Public key of the account, corresponding with a secret key to use. */
          publicKey: secondMember.address,
        },
      ],
    },
  ],
}));

vi.mock("~/service/token", () => ({
  fetchTokenMeta: async (mint: Address) => {
    if (mint === SOL_MINT_ADDRESS) {
      return {
        name: "Solana",
        symbol: "SOL",
        decimals: 9,
        address: mint,
        logoURI:
          "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
      };
    }

    return {
      name: "Test",
      symbol: "TEST",
      decimals: 6,
      address: mint,
      logoURI:
        "https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I",
    };
  },
  fetchTokenPrice: async () => 220.28,
}));

vi.mock("@solana/react", () => ({
  useWalletAccountTransactionSigner: (walletAccount: any, chainId: string) => {
    if (walletAccount.address === creator.address) {
      return creator;
    }

    return secondMember;
  },
}));

const {
  creator,
  secondMember,
  thirdMember,
  vaultAddress,
  multisigAddress,
  rentCollectorAddress,
} = await getTestAccountsWithBalances();

console.log(
  "/********************* Accounts ***********************/",
  "\n",
  {
    creator: creator.address,
    secondMember: secondMember.address,
    thirdMember: thirdMember.address,
    vaultAddress: vaultAddress,
    multisigAddress: multisigAddress,
    rentCollectorAddress: rentCollectorAddress,
  },
  "\n",
  "/******************************************************/",
);

const token = await createMintAndMintTo({
  payer: creator,
  recipient: vaultAddress,
  tokenProgramAddress: TOKEN_PROGRAM_ADDRESS,
});

const token2022 = await createMintAndMintTo({
  payer: creator,
  recipient: vaultAddress,
  tokenProgramAddress: TOKEN_2022_PROGRAM_ADDRESS,
});

describe("Browser", () => {
  beforeAll(async () => {
    useWalletStore.getState().addMultisig({
      address: multisigAddress,
      defaultVault: vaultAddress,
      account: {
        members: [
          {
            key: creator.address,
            permissions: { mask: 7 },
          },
          {
            key: secondMember.address,
            permissions: { mask: 2 },
          },
          {
            key: thirdMember.address,
            permissions: { mask: 2 },
          },
        ],
      },
    });
  });

  test("Render <App />", async () => {
    await page.viewport(1280, 720);

    useWalletStore.getState().addWalletStorage({
      name: walletNameTest1,
      address: creator.address,
      icon: "",
    });

    useWalletStore.getState().selectWalletName(walletNameTest1);

    expect(useWalletStore.getState().walletStorage?.address).equal(
      creator.address,
    );

    const screen = render(
      <WithQueryProvider>
        <App />
      </WithQueryProvider>,
    );

    await page.screenshot({ path: "dashboard.png", animations: "disabled" });

    const firstCoin = screen.getByRole("button", { name: "Solana" });

    await firstCoin.click();

    const withdrawDialogTitle = screen.getByRole("heading", {
      name: "Withdraw",
    });

    expect(withdrawDialogTitle).toBeVisible();

    await page.screenshot({
      path: "withdraw-dialog.png",
      animations: "disabled",
    });

    const inputAddress = screen.getByPlaceholder("Enter wallet address");
    const maxButton = screen.getByRole("button", { name: "MAX" });

    await maxButton.click();
    await inputAddress.fill(secondMember.address);

    await page.screenshot({
      path: "withdraw-dialog-address.png",
      animations: "disabled",
    });

    const initiateButton = screen.getByRole("button", { name: "Initiate" });

    await initiateButton.click();

    await page.screenshot({
      path: "withdraw-dialog-initiate.png",
      animations: "disabled",
    });

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const transaction = screen.getByText("Send");

    screen.debug(transaction);

    // await transaction.click();

    expect(transaction).toBeVisible();
  });
});
