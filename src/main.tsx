import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { LibraryProvider } from "./features/library/LibraryProvider";
import { AuthProvider } from "./features/auth/AuthProvider";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 15, retry: 1 } },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <LibraryProvider>
            <App />
          </LibraryProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
