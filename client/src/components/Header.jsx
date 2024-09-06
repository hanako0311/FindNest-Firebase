import { Avatar, Button, Dropdown, Navbar, Modal, Spinner } from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice";
import { useState } from "react";
import { signoutSuccess } from "../redux/user/userSlice";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";


export default function Header() {
  const path = useLocation().pathname;
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const [showSignoutModal, setShowSignoutModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignout = async () => {
    setLoading(true);
    try {
      // Sign out the user
      await signOut(auth);
  
      // Dispatch signoutSuccess action
      dispatch(signoutSuccess());
      setShowSignoutModal(false);
    } catch (error) {
      console.error("Sign out failed:", error.message);
      setShowSignoutModal(false); // Close the modal on error as well
    } finally {
      setLoading(false); // Set loading to false once the operation is complete
    }
  };

  return (
    <Navbar className="border-b-2">
      <Link to="/" className="flex items-center">
        <img
          src={
            theme === "dark"
              ? "/FindNestYellowLogo-R.svg"
              : "/FindNestRedLogo-W.svg"
          }
          className="mr-2 h-6 sm:h-9"
          alt="FindNest Logo"
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          FindNest
        </span>
      </Link>

      <div className="flex gap-2 md:order-2 items-center">
        <Button
          className="w-12 h-10"
          color="gray"
          pill
          onClick={() => dispatch(toggleTheme())}
        >
          {theme === "light" ? <FaSun /> : <FaMoon />}
        </Button>
        {currentUser ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar alt="user" img={currentUser.profilePicture} rounded />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">@{currentUser.username}</span>
              <span className="block text-sm font-medium truncate">
                {currentUser.email}
              </span>
            </Dropdown.Header>
            <Link to={"/dashboard?tab=analytics"}>
              <Dropdown.Item>Dashboard</Dropdown.Item>
            </Link>
            <Link to={"/dashboard?tab=profile"}>
              <Dropdown.Item>Profile</Dropdown.Item>
            </Link>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => setShowSignoutModal(true)}>
              Sign out
            </Dropdown.Item>
          </Dropdown>
        ) : (
          <Link to="/sign-in">
            <Button gradientMonochrome="failure" outline>
              Sign In
            </Button>
          </Link>
        )}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        {!path.startsWith("/dashboard") && (
          <>
            <Navbar.Link active={path === "/"} as={"div"}>
              <Link to="/">Home</Link>
            </Navbar.Link>
            <Navbar.Link active={path === "/about-us"} as={"div"}>
              <Link to="/about-us">About Us</Link>
            </Navbar.Link>
            <Navbar.Link active={path === "/features"} as={"div"}>
              <Link to="/features">Features</Link>
            </Navbar.Link>
            <Navbar.Link active={path === "/contact-us"} as={"div"}>
              <Link to="/contact-us">Contact Us</Link>
            </Navbar.Link>
          </>
        )}
      </Navbar.Collapse>

      <Modal
      show={showSignoutModal}
      onClose={() => setShowSignoutModal(false)}
      popup
      size="md"
    >
      <Modal.Header />
      <Modal.Body>
        <div className="text-center">
          {loading ? (
            <div className="flex justify-center">
              <Spinner /> {/* Display your spinner component */}
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </Modal.Body>
    </Modal>
    </Navbar>
  );
}
