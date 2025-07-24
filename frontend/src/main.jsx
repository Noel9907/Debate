import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { BrowserRouter, HashRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <HashRouter> */}
    <BrowserRouter>
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </BrowserRouter>
    {/* </HashRouter> */}
  </StrictMode>
);
