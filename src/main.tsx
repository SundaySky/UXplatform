import { StrictMode, type FC, type PropsWithChildren } from "react";
import { createRoot } from "react-dom/client";
import { TruffleThemeProvider } from "@sundaysky/smartvideo-hub-truffle-component-library";
import App from "./App";

const ThemeProvider = TruffleThemeProvider as FC<PropsWithChildren>;

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </StrictMode>
);
