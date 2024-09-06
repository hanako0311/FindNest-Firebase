import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashSidebar from "../components/DashSidebar";
import DashProfile from "../components/DashProfile";
import DashAnalytics from "../components/DashAnalytics"; // Import the DashAnalytics component
import DashFoundItem from "../components/DashFoundItem"; // Import the DashFoundItems component
import DashCrudItems from "../components/DashCrudItems";
import DashUsers from "../components/DashUsers";
import DashItems from "../components/DashItems";

export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState("");
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    } else {
      setTab("profile");
    }
  }, [location.search]);
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-56">
        {/*Sidebar*/}
        <DashSidebar />
      </div>
      {/* Dynamically render components based on the tab state */}
      {tab === "profile" && <DashProfile />}
      {tab === "analytics" && <DashAnalytics />}
      {tab === "found-items" && <DashFoundItem />}
      {tab === "crud-items" && <DashItems />}
      {tab === "crud-users" && <DashUsers />}
    </div>
  );
}
