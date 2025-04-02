import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navigation from "./components/Pages/Navigation";
import Cookies from "js-cookie";
import EulaModal from "./components/Pages/EulaModal";
import "./styles.css";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === "/";
  const isHomePage = location.pathname === "/home";

  const [showEula, setShowEula] = useState(false);

  useEffect(() => {
    const auth = Cookies.get("auth");
    const eulaAccepted = Cookies.get("eula_accepted");

    if (auth && isLoginPage) {
      navigate("/home");
    }

    if (auth && isHomePage && !eulaAccepted) {
      setShowEula(true);
    }
  }, [isLoginPage, isHomePage, navigate]);

  return (
    <>
      {/* ✅ App layout always renders */}
      <div className="flex">
        {!isLoginPage && <Sidebar />}
        <div className={`main-container ${isLoginPage ? "w-full" : "ml-64"}`}>
          <Navigation />
        </div>
      </div>

      {/* ✅ EULA modal overlays on top */}
      {showEula && <EulaModal onClose={() => setShowEula(false)} />}
    </>
  );
}

function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<App />} />
      </Routes>
    </Router>
  );
}

export default AppWrapper;
