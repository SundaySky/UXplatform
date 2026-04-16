import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TruffleThemeProvider } from "@sundaysky/smartvideo-hub-truffle-component-library";
import App from "./App";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <TruffleThemeProvider>
            <App />
        </TruffleThemeProvider>
    </StrictMode>
);
