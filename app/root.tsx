import {
  Links,
  Meta,
  Outlet,
  Scripts,
  LinksFunction,
  ScrollRestoration,
} from "react-router";
import { ReactNode, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  persistQueryClient,
  persistQueryClientSave,
} from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

import "./global.css";

export const links: LinksFunction = () => [
  { rel: "icon", href: "/favicon.png" },
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24 hours

      refetchOnMount: false,
      refetchInterval: false,
      refetchOnWindowFocus: false,
    },
  },
});

persistQueryClient({
  queryClient,
  persister: createSyncStoragePersister({
    key: "fuse:query-client",
    storage: typeof window === "undefined" ? null : window.localStorage,
  }),
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      return true;

      return [
        "balance",
        "tokenMeta",
        "tokenPrice",
        "transaction",
        "multisigAccount",
        "multisigWalletsByKey",
      ].includes(query.queryKey[0] as string);
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
