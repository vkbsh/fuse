import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import App from "~/App";
import WithQueryProvider from "~/components/WithQueryProvider";

export default function Root() {
  return (
    <WithQueryProvider>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </WithQueryProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
