import { BrowserRouter as Router } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navigation from "./components/Pages/Navigation";
import "./styles.css";

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="main-container">
          <Navigation />
        </div>
      </div>
    </Router>
  );
}

export default App;
