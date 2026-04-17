import { StrictMode, type FC, type PropsWithChildren } from "react";
import { createRoot } from "react-dom/client";
import { StyledEngineProvider } from "@mui/material";
import { TruffleThemeProvider, TruffleGradientDefinitions } from "@sundaysky/smartvideo-hub-truffle-component-library";
import App from "./App";
import "./index.css";

const ThemeProvider = TruffleThemeProvider as FC<PropsWithChildren>;

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <StyledEngineProvider injectFirst>
            <ThemeProvider>
                <TruffleGradientDefinitions />
                <App />
            </ThemeProvider>
        </StyledEngineProvider>
    </StrictMode>
);
