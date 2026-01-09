import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
// import Navbar from "./Navbar.jsx"; 

export default function MainLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {/* <Navbar /> */}
        <Outlet />
      </div>
    </div>
  );
}
