import {
  Links,
  Meta,
  Outlet,
  Scripts,
  LinksFunction,
  ScrollRestoration,
} from "react-router";
import { ReactNode, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import superjson from "superjson";

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "./global.css";

export const links: LinksFunction = () => [
  { rel: "icon", href: "/favicon.png" },
];

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: 1000 * 60 * 60 * 24,
            staleTime: 1000 * 60 * 60 * 24,
          },
        },
      }),
  );

  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage: window.localStorage,
      key: "fuse:query-client",
    }),
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24,
        buster: "v0.0.1",
        hydrateOptions: {
          defaultOptions: {
            deserializeData: (data) => superjson.parse(data),
          },
        },
        dehydrateOptions: {
          serializeData: (data) => superjson.stringify(data),
          shouldRedactErrors: () => {
            return true;
          },

          shouldDehydrateQuery: (query) => {
            return query.state.status === "success" && !!query.meta?.persist;
          },
        },
      }}
    >
      <Outlet />
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
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
