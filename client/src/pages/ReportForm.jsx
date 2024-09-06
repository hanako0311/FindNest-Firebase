import React, { useState, useEffect, useCallback, useRef } from "react";
import { FileInput, TextInput, Select, Button, Alert } from "flowbite-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../firebase";
import { HiOutlineTrash } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { useSelector } from "react-redux";

export default function CreateLostFoundPost() {
  const { currentUser } = useSelector((state) => state.user);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    item: "",
    dateFound: new Date(),
    location: "",
    description: "",
    category: "",
    imageUrls: [],
    department: currentUser?.department,
    userRef: currentUser?.id,
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [reportSubmitError, setReportSubmitError] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(null);
  const [key, setKey] = useState(0);
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const navigate = useNavigate();
  const webcamRef = useRef(null);

  const handleImageSubmit = (e) => {
    if (files.length > 0 && formData.imageUrls.length + files.length <= 5) {
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }

      Promise.all(promises)
        .then((urls) => {
          setFormData((prevFormData) => ({
            ...prevFormData,
            imageUrls: prevFormData.imageUrls.concat(urls),
          }));
          setImageUploadError(false);
        })
        .catch((err) => {
          setImageUploadError(
            "Image upload failed: Each image must be less than 2MB."
          );
        });
    } else {
      setImageUploadError("You can only upload up to 5 images per report.");
    }
    setFiles([]); // Clear files after upload
    setKey((prevKey) => prevKey + 1); // Increment key to force re-render of file input
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Remove progress display logic
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

  const handleRemoveImage = (index) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      imageUrls: prevFormData.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      dateFound: date,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure all images are uploaded before submission
      if (files.length > 0) {
        handleImageSubmit();
      }
      
      const res = await fetch("/api/items/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Send the formData including imageUrls
      });
  
      const data = await res.json();
      if (!res.ok) {
        setReportSubmitError(data.message);
        return;
      }
  
      setReportSuccess("Item reported successfully!");
      setReportSubmitError(null);
  
      setTimeout(() => navigate("/dashboard?tab=found-items"), 3000); 
  
      // Reset the form
      setFormData({
        item: "",
        dateFound: new Date(),
        location: "",
        description: "",
        category: "",
        imageUrls: [],
        department: "", 
      });
      setFiles([]); 
      setKey((prevKey) => prevKey + 1);
    } catch (error) {
      setReportSubmitError("Something went wrong");
      setReportSuccess(null);
    }
  };
  

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    handleUploadCapturedImage(imageSrc);
  }, [webcamRef]);

  const handleUploadCapturedImage = async (imageSrc) => {
    const blob = await fetch(imageSrc).then((res) => res.blob());
    const file = new File([blob], `captured-image-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    try {
      const url = await storeImage(file);
      setFormData((prevFormData) => ({
        ...prevFormData,
        imageUrls: prevFormData.imageUrls.concat(url),
      }));
      setCapturedImage(null);
      setShowWebcam(false);
    } catch (err) {
      setImageUploadError(
        "Image upload failed: Each image must be less than 2MB."
      );
    }
  };

  const categories = [
    "Mobile Phones",
    "Laptops/Tablets",
    "Headphones/Earbuds",
    "Chargers and Cables",
    "Cameras",
    "Electronic Accessories",
    "Textbooks",
    "Notebooks",
    "Stationery Items",
    "Art Supplies",
    "Calculators",
    "Coats and Jackets",
    "Hats and Caps",
    "Scarves and Gloves",
    "Bags and Backpacks",
    "Sunglasses",
    "Jewelry and Watches",
    "Umbrellas",
    "Wallets and Purses",
    "ID Cards and Passports",
    "Keys",
    "Personal Care Items",
    "Sports Gear",
    "Gym Equipment",
    "Bicycles and Skateboards",
    "Musical Instruments",
    "Water Bottles",
    "Lunch Boxes",
    "Toys and Games",
    "Decorative Items",
    "Other",
  ];

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">
        Report Found Item
      </h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TextInput
            type="text"
            placeholder="Item Found"
            required
            name="item"
            className="flex-auto sm:flex-1"
            onChange={handleChange}
            value={formData.item}
          />
          <Select
            name="category"
            required
            className="w-full sm:w-1/4"
            onChange={handleChange}
            value={formData.category}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TextInput
            type="text"
            placeholder="Location Found"
            required
            name="location"
            className="flex-auto sm:flex-1"
            onChange={handleChange}
          />
          <div className="w-full sm:w-1/4">
            <DatePicker
              selected={formData.dateFound}
              onChange={handleDateChange}
              required
              maxDate={new Date()}
              className="w-full p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
        </div>
        <textarea
          className="block w-full p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Describe the item..."
          required
          rows="4"
          name="description"
          onChange={handleChange}
          value={formData.description}
        ></textarea>

        <div className="flex gap-4 items-center">
          <FileInput
            key={key}
            type="file"
            id="images"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            disabled={formData.imageUrls.length >= 5} // Disable the file input if the limit is reached
          />
          {formData.imageUrls.length >= 5 && (
            <Alert color="info">
              You have reached the maximum limit of 5 images.
            </Alert>
          )}
          <Button
            type="button"
            gradientDuoTone="pinkToOrange"
            onClick={handleImageSubmit}
          >
            Upload Image
          </Button>
          <Button
            type="button"
            gradientDuoTone="purpleToPink"
            onClick={() => setShowWebcam(!showWebcam)}
          >
            {showWebcam ? "Close Webcam" : "Open Webcam"}
          </Button>
        </div>

        {showWebcam && (
          <div className="flex flex-col items-center mt-4">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-64 border-2 border-gray-300 rounded-lg"
            />
            <Button
              type="button"
              gradientDuoTone="greenToBlue"
              onClick={handleCapture}
              className="mt-2"
            >
              Capture Image
            </Button>
          </div>
        )}

        {imageUploadError && <Alert color="failure">{imageUploadError}</Alert>}
        {formData.imageUrls.length > 0 && (
          <div className="flex space-x-4">
            {formData.imageUrls.map((url, index) => (
              <div
                key={url}
                className="flex flex-col items-center p-4 border border-gray-300 shadow rounded-lg hover:shadow-md transition-shadow"
              >
                <img
                  src={url}
                  alt={`listing ${index}`}
                  className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="mt-3 text-red-600 hover:text-red-800"
                >
                  <HiOutlineTrash className="w-6 h-6" />
                </button>
              </div>
            ))}
          </div>
        )}
        <Button type="submit" gradientDuoTone="pinkToOrange">
          Submit Found Item
        </Button>
        {reportSuccess && (
          <Alert color="success">{reportSuccess}</Alert> // Display the success alert
        )}
        {reportSubmitError && (
          <Alert color="failure">{reportSubmitError}</Alert>
        )}
      </form>
    </div>
  );
}
