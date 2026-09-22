import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PrefProvider } from "./context/prefContext";
import { LanguageProvider } from "./context/languageContext";
import { ThemeProvider } from "./context/themeContext";
import { ToastProvider } from "./component/common/Toaster";
import Dashboard from "./layout/Dashboard";
import HomePage from "./pages/ClientPortal/HomePage";

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <PrefProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<Dashboard />}>
                  <Route path="/" element={<HomePage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </PrefProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
