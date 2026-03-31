import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline } from "@mui/material";
import { TruffleThemeProvider } from "@sundaysky/smartvideo-hub-truffle-component-library";
import App from "./App";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {/* @ts-expect-error TruffleThemeProvider accepts children but FC typing omits it */}
        <TruffleThemeProvider>
            <CssBaseline />
            <App />
        </TruffleThemeProvider>
    </StrictMode>
);
