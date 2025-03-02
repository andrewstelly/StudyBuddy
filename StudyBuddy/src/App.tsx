import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navigation from "./components/Pages/Navigation";
import Cookies from "js-cookie";
import "./styles.css";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === "/";

  useEffect(() => {
    const auth = Cookies.get("auth");
    if (auth && isLoginPage) {
      navigate("/home");
    }
  }, [isLoginPage, navigate]);

  return (
    <div className="flex">
      {!isLoginPage && <Sidebar />}
      <div className={`main-container ${isLoginPage ? "w-full" : "ml-64"}`}>
        <Navigation />
      </div>
    </div>
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