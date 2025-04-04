import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";
import Navbar from "./navbar";

function ShoppingLayout() {
  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* common header */}
      <Navbar />
      <main className="flex flex-col w-full">
        <Outlet />
      </main>
    </div>
  );
}

export default ShoppingLayout;
