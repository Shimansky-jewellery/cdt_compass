import { HashRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Compass from "./components/Compass.jsx";
import FamousDiamonds from "./pages/FamousDiamonds.jsx";
import Home from "./pages/Home.jsx";
import "./App.css";

export default function App() {
  return (
    <HashRouter>
      <div className="appShell">
        <Navbar />
        <div className="routeContent">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/compass" element={<Compass />} />
            <Route path="/famous-diamonds" element={<FamousDiamonds />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </HashRouter>
  );
}
