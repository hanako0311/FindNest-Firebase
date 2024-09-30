import { Sidebar, Modal, Button, Dropdown } from "flowbite-react";
import {
  HiArrowSmRight,
  HiUser,
  HiOutlineExclamationCircle,
  HiClipboardList,
  HiViewGrid,
  HiChevronUp,
  HiChevronDown,
  HiViewBoards,
  HiOutlineDocumentSearch,
  HiUserGroup,
  HiArchive,
} from "react-icons/hi";
import { Disclosure } from "@headlessui/react";
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { signoutSuccess } from "../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function DashSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState("");
  const [showSignoutModal, setShowSignoutModal] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    } else {
      setTab("profile");
    }
  }, [location.search]);

  const handleSignout = async () => {
    try {
      // Sign out the user
      await signOut(auth);

      // Redirect to the login page
      dispatch(signoutSuccess());
      window.location.href = "/sign-in"; // Or another appropriate page
    } catch (error) {
      console.error("Sign out failed:", error.message);
      setShowSignoutModal(false); // Close the modal on error as well
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "superAdmin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "staff":
        return "Staff";
      default:
        return "User"; // default case for unidentified roles or if no role is found
    }
  };

  return (
    <Sidebar className="w-full md:w-56">
      <Sidebar.Items>
        <Sidebar.ItemGroup className="flex flex-col gap-1">
          <Sidebar.Item
            active={tab === "analytics"}
            icon={HiViewGrid}
            as={Link}
            to="/dashboard?tab=analytics"
          >
            Dashboard
          </Sidebar.Item>
          <Sidebar.Item
            active={tab === "profile"}
            icon={HiUser}
            label={getRoleLabel(currentUser.role)} // Make sure currentUser and role exist
            labelColor="dark"
            as={Link}
            to="/dashboard?tab=profile"
          >
            Profile
          </Sidebar.Item>
          <Sidebar.Item
            active={tab === "report-form"}
            icon={HiClipboardList}
            as={Link}
            to="/report-form"
          >
            Report Form
          </Sidebar.Item>

          <Sidebar.Item
            active={tab === "crud-items"}
            icon={HiArchive}
            as={Link}
            to="/dashboard?tab=crud-items"
          >
            Items
          </Sidebar.Item>
          {(currentUser.role === "admin" ||
            currentUser.role === "superAdmin") && (
            <Sidebar.Item
              active={tab === "crud-users"}
              icon={HiUserGroup}
              as={Link}
              to="/dashboard?tab=crud-users"
            >
              Users
            </Sidebar.Item>
          )}
          <Sidebar.Item
            icon={HiArrowSmRight}
            className="cursor-pointer"
            onClick={() => setShowSignoutModal(true)} // Open modal on click
          >
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>

      <Modal
        show={showSignoutModal}
        onClose={() => setShowSignoutModal(false)}
        popup
        size="md"
        className="flex items-center justify-center min-h-screen"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg font-semibold text-gray-500 dark:text-gray-400">
              Are you sure you want to sign out?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleSignout}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowSignoutModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </Sidebar>
  );
}
