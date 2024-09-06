import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";

import { auth } from '../firebase'; // Adjust the path as necessary
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function SignIn() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value.trim() }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(signInStart());
  
    try {
      const { email, password } = formData;
      await signInWithEmailAndPassword(auth, email, password);
  
      const user = auth.currentUser;
      if (user) {
        // Fetch additional user data from your server
        const response = await fetch(`/api/users/${user.uid}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user data from server.");
        }
  
        const userData = await response.json();
        dispatch(signInSuccess(userData)); // Pass userData to your Redux store
        navigate("/dashboard?tab=analytics");
      }
    } catch (err) {
      dispatch(signInFailure(err.message));
    }
  };
  
  

  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        {/* Left */}
        <div className="flex-1">
          <Link to="/" className="font-bold dark:text-white text-4xl">
            FindNest
          </Link>
          <p className="text-sm mt-5">
            Please sign in with your staff account credentials.
          </p>
        </div>
        {/* Right */}
        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email" value="Your email" />
              <TextInput
                type="email"
                placeholder="name@company.com"
                id="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <Label htmlFor="password" value="Your password" />
              <TextInput
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="**********"
                value={formData.password}
                onChange={handleChange}
              />
              <div className="absolute inset-y-0 right-4 mt-5 flex items-center">
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <Button
              gradientDuoTone="purpleToPink"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Loading...</span>
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          {error && (
            <Alert className="mt-5" color="failure">
              {error}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
