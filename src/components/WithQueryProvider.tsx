import superjson from "superjson";
import { type ReactNode, useMemo } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

export default function WithQueryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const queryClient = useMemo(() => new QueryClient(), []);
  const persister = useMemo(
    () =>
      createAsyncStoragePersister({
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
      {children}
    </PersistQueryClientProvider>
  );
}
