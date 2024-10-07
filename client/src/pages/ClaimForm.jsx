import React, { useState, useRef } from "react";
import { TextInput, Button, Alert } from "flowbite-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Webcam from "react-webcam";
import { useNavigate, useParams } from "react-router-dom";
import {
  getStorage,
  ref as firebaseRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../firebase"; // Ensure correct path
import { HiCheck } from "react-icons/hi";
import { useSelector } from "react-redux";

export default function ClaimForm() {
  const { itemId } = useParams(); // Retrieve itemId from URL
  const [formData, setFormData] = useState({
    claimantName: "",
    date: new Date(),
    claimantImage: null, // Directly store the URL of the claimant's image
    imagePreview: null, // Local state to manage the image preview
  });
  const [showAlert, setShowAlert] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const webcamRef = React.useRef(null);
  const fileInputRef = useRef(null); // Ref for the file input

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, date }));
  };

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFormData((prev) => ({
      ...prev,
      imagePreview: imageSrc,
      claimantImage: null, // Reset the image URL when new photo is captured
    }));
    setShowWebcam(false);
    handleUploadCapturedImage(imageSrc);
  };

  const handleUploadCapturedImage = async (imageSrc) => {
    const blob = await fetch(imageSrc).then((res) => res.blob());
    const file = new File([blob], `captured-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
    const url = await storeImage(file);
    setFormData((prev) => ({
      ...prev,
      claimantImage: url,
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await storeImage(file);
      setFormData((prev) => ({
        ...prev,
        claimantImage: url,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const storeImage = async (file) => {
    const storage = getStorage(app);
    const fileName = `claims/${itemId}/${Date.now()}-${file.name}`;
    const storageRef = firebaseRef(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Handle progress
        },
        (error) => {
          console.error("Upload error:", error);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              resolve(downloadURL);
            })
            .catch((error) => {
              console.error("Failed to get download URL:", error);
              reject(error);
            });
        }
      );
    });
  };

  const resetInputFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
    setFormData((prev) => ({
      ...prev,
      imagePreview: null,
      claimantImage: null,
    }));
  };

  const toggleWebcam = () => {
    setShowWebcam((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedDate = formData.date.toISOString(); // Ensure the date is in ISO string format

    const submissionData = {
      claimantName: formData.claimantName || currentUser.name, // Ensure claimantName is set
      date: formattedDate,
      userRef: currentUser?.id || "anonymousUser", // Use current user's ID
      claimantImage: formData.claimantImage, // Use the direct image URL
    };

    console.log("Submitting form data:", submissionData); // Log submission data

    try {
      console.log("Submitting form...", submissionData, "for item ID:", itemId);
      const response = await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      console.log("Response status:", response.status); // Log response status

      if (response.ok) {
        setShowAlert(true); // Show success alert
        setTimeout(() => {
          setShowAlert(false); // Hide alert after a delay
          // Redirect to the DashFoundItems section
          navigate("/dashboard?tab=found-items"); // Redirect back to DashFoundItems section
        }, 2000); // Delay for alert visibility
      } else {
        const errorData = await response.json(); // Parsing response to get error details
        throw new Error(errorData.message || "Failed to submit claim");
      }
    } catch (error) {
      console.error("Submission failed", error);
      alert("Submission Failed! " + error.message);
    }
  };

  return (
    <div className="p-3 max-w-xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Claim Form</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextInput
          type="text"
          placeholder="Name"
          required
          name="claimantName"
          className="w-full"
          onChange={handleChange}
          value={formData.claimantName || currentUser.name || ""}
        />
        <DatePicker
          selected={formData.date}
          onChange={handleDateChange}
          required
          maxDate={new Date()}
          className="w-full p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <Button onClick={toggleWebcam} gradientDuoTone="purpleToBlue">
          {showWebcam ? "Close Webcam" : "Open Webcam"}
        </Button>
        {showWebcam && (
          <div className="my-4">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-auto"
            />
            <Button onClick={capture} gradientDuoTone="cyanToBlue">
              Capture Photo
            </Button>
          </div>
        )}
        {formData.imagePreview && (
          <div className="mt-4">
            <p className="text-sm font-semibold">Preview:</p>
            <img
              src={formData.imagePreview}
              alt="Preview"
              className="w-full max-h-64 rounded-lg shadow-md"
            />
            <Button onClick={resetInputFile} gradientDuoTone="redToYellow">
              Retake/Re-upload
            </Button>
          </div>
        )}
        <Button type="submit" gradientDuoTone="cyanToBlue">
          Confirm
        </Button>
        {showAlert && (
          <Alert
            type="success"
            onClose={() => setShowAlert(false)}
            className="mt-4"
          >
            <div className="flex items-center">
              <HiCheck className="h-5 w-5 mr-2" />
              Item Claimed Successfully!
            </div>
          </Alert>
        )}
      </form>
    </div>
  );
}
