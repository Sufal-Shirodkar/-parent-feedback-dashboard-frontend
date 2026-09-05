import { useEffect, useState } from "react";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./hooks/useAuth";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import { getPath, replace } from "./utils/navigation";

function ProtectedApp() {
  const { user, loading } = useAuth();
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    function onPopState() {
      setPath(getPath());
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user && path !== "/login") {
      replace("/login");
      return;
    }

    if (user && path !== "/dashboard") {
      replace("/dashboard");
    }
  }, [user, loading, path]);

  if (loading) {
    return (
      <div className="app-boot" role="status">
        Loading dashboard...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <DashboardPage />;
}

function App() {
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  );
}

export default App;
