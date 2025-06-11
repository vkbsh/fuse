import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import superjson from "superjson";
import { ReactNode, useMemo } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

import "./global.css";

export const links: LinksFunction = () => [
  { rel: "icon", href: "/favicon.png" },
];

export default function App() {
  const queryClient = useMemo(() => new QueryClient(), []);
  const persister = useMemo(
    () =>
      createSyncStoragePersister({
        key: "fuse:query-client",
        storage:
          typeof window !== "undefined" ? window.localStorage : undefined,
      }),
    [],
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        buster: "v0.0.1",
        hydrateOptions: {
          defaultOptions: {
            deserializeData: (data) => superjson.parse(data),
          },
        },
        dehydrateOptions: {
          shouldRedactErrors: () => true,
          serializeData: (data) => superjson.stringify(data),
          shouldDehydrateQuery: (query) => query.state.status === "success",
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
