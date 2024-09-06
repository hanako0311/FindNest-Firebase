import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

export default function OnlySuperAdminPrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);

  // Check if currentUser exists and if the role is "superAdmin"
  if (currentUser && currentUser.role === "superAdmin") {
    return <Outlet />;
  } else {
    // Redirect to sign-in page if currentUser doesn't exist or role is not "superAdmin"
    return <Navigate to="/sign-in" />;
  }
}
