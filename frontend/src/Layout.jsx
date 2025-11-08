import { Outlet } from "react-router-dom";
import Navbar from "./component/Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-1">
        <Outlet /> 
      </main>
    </div>
  );
}
