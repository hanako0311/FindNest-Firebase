import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

export default function OnlyAdminPrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);

  // Check if currentUser exists and if the role is "admin"
  if (currentUser && currentUser.role === "admin") {
    return <Outlet />;
  } else {
    // Redirect to sign-in page if currentUser doesn't exist or role is not "admin"
    return <Navigate to="/sign-in" />;
  }
}
