import { StrictMode, type FC, type PropsWithChildren } from "react";
import { createRoot } from "react-dom/client";
import { StyledEngineProvider } from "@mui/material";
import { TruffleThemeProvider, TruffleGradientDefinitions } from "@sundaysky/smartvideo-hub-truffle-component-library";
import App from "./App";
import RecorderOverlay from "./recorder/RecorderOverlay";
import PlayerOverlay from "./recorder/PlayerOverlay";
import "./index.css";
import "@fortawesome/fontawesome-pro/css/all.css";

const ThemeProvider = TruffleThemeProvider as FC<PropsWithChildren>;

// Recording mode relies on React fiber `_debugSource`, which is only populated
// in dev builds (vite-plugin-react). Mount only in dev.
const isDev = import.meta.env.DEV;

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <StyledEngineProvider injectFirst>
            <ThemeProvider>
                <TruffleGradientDefinitions />
                <App />
                {isDev && <RecorderOverlay />}
                {isDev && <PlayerOverlay />}
            </ThemeProvider>
        </StyledEngineProvider>
    </StrictMode>
);
