import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Modal, TextInput, Button } from "flowbite-react";

const UserModal = ({
  show,
  onClose,
  user,
  onSave,
  departments,
  currentUser,
}) => {
  const [localUser, setLocalUser] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    username: "",
    email: "",
    department: currentUser.role === "admin" ? currentUser.department : "", // Auto-set department for admin
    role: currentUser.role === "admin" ? "staff" : "staff", // Admin can only create staff
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (user) {
      setLocalUser(user);
    } else {
      setLocalUser({
        firstName: "",
        middleName: "",
        lastName: "",
        username: "",
        email: "",
        department: currentUser.role === "admin" ? currentUser.department : "",
        role: currentUser.role === "admin" ? "staff" : "staff",
        password: "",
      });
    }
  }, [user]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setLocalUser((prevUser) => ({ ...prevUser, [id]: value }));
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setLocalUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // If the current user is an admin, ensure the department stays the same
    if (currentUser.role === "admin") {
      localUser.department = currentUser.department; // Enforce the admin's department for staff
    }

    const { firstName, lastName, username, email, department, password } =
      localUser;

    // Required fields for both adding and updating
    if (!firstName || !lastName || !username || !email || !department) {
      setErrorMessage("All fields are required except password for updates!");
      return;
    }

    // If it's a new user (i.e., no id), require password
    if (!localUser.id && !password) {
      setErrorMessage("Password is required for new users!");
      return;
    }

    // Validate role permissions using the existing function
    const roleValidationError = validateRolePermissions();
    if (roleValidationError) {
      setErrorMessage(roleValidationError);
      // Automatically clear the error message after 5 seconds
      setTimeout(() => {
        setErrorMessage("");
      }, 5000);

      return;
    }

    // Proceed with saving the user (password will be included only if provided)
    onSave(localUser);
  };

  const validateRolePermissions = () => {
    if (currentUser.role !== "superAdmin" && localUser.role === "superAdmin") {
      return "Only superAdmins can assign the superAdmin role.";
    }
    if (
      currentUser.role === "admin" &&
      (localUser.role === "superAdmin" || localUser.role === "admin")
    ) {
      return "Admins cannot assign admin or superAdmin roles.";
    }
    return null;
  };

  return (
    <Modal show={show} onClose={onClose} size="2xl">
      <Modal.Header>{user ? "Edit User" : "Add New User"}</Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="firstName"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                First Name
              </label>
              <TextInput
                id="firstName"
                type="text"
                placeholder="First Name"
                value={localUser.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="middleName"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Middle Name
              </label>
              <TextInput
                id="middleName"
                type="text"
                placeholder="Middle Name"
                value={localUser.middleName}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="lastName"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Last Name
              </label>
              <TextInput
                id="lastName"
                type="text"
                placeholder="Last Name"
                value={localUser.lastName}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="username"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Username
              </label>
              <TextInput
                id="username"
                type="text"
                placeholder="Username"
                value={localUser.username}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Email
              </label>
              <TextInput
                id="email"
                type="text"
                placeholder="Email"
                value={localUser.email}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="department"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Department
              </label>
              {currentUser.role === "superAdmin" ? (
                // SuperAdmin can edit the department
                <div className="flex space-x-4">
                  {departments.map((dept) => (
                    <label key={dept} className="flex items-center">
                      <input
                        type="radio"
                        id="department"
                        name="department"
                        value={dept}
                        checked={localUser.department === dept}
                        onChange={handleChange}
                        className="form-radio"
                        required
                      />
                      <span className="ml-2">{dept}</span>
                    </label>
                  ))}
                </div>
              ) : (
                // Admin can only view the department (read-only)
                <TextInput
                  id="department"
                  type="text"
                  value={currentUser.department} // Admin's department is automatically set
                  readOnly
                  disabled
                />
              )}
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Password {localUser.id ? "(Update)" : "(Required)"}
              </label>
              <div className="relative">
                <TextInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={localUser.password}
                  onChange={handleChange}
                  required={!localUser.id} // Required only for new users (when no id exists)
                />
                <div className="absolute inset-y-0 right-3 flex items-center text-sm leading-5">
                  <button type="button" onClick={togglePasswordVisibility}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            {currentUser.role === "superAdmin" && (
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="role"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Role
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      id="role"
                      name="role"
                      value="admin"
                      checked={localUser.role === "admin"}
                      onChange={handleRadioChange}
                      className="form-radio"
                    />
                    <span className="ml-2">Admin</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      id="role"
                      name="role"
                      value="staff"
                      checked={localUser.role === "staff"}
                      onChange={handleRadioChange}
                      className="form-radio"
                    />
                    <span className="ml-2">Staff</span>
                  </label>
                </div>
              </div>
            )}
          </div>
          {errorMessage && (
            <div className="mb-4 text-red-500">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="mb-4 text-green-500">{successMessage}</div>
          )}
          <div className="items-center p-6 border-t border-gray-200 rounded-b dark:border-gray-700">
            <Button
              type="submit"
              gradientDuoTone="pinkToOrange"
              className="w-full"
            >
              Save
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default UserModal;
