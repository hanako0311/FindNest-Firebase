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
    foundByName: "", // Field for the person who found the item
    staffInvolved: "", // Text field for staff involved
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [reportSubmitError, setReportSubmitError] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(null);
  const [key, setKey] = useState(0);
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const navigate = useNavigate();
  const webcamRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

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
          setTimeout(() => setImageUploadError(null), 3000);
        });
    } else {
      setImageUploadError(
        "Please select at least one image, but no more than five, to continue."
      );
      setTimeout(() => setImageUploadError(null), 3000);
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
        null,
        (error) => {
          console.error("Upload error:", error);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => resolve(downloadURL))
            .catch((error) => reject(error));
        }
      );
    });
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
      setImageUploadError("Image upload failed: Each image must be less than 2MB.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.imageUrls.length === 0) {
      setReportSubmitError(
        "At least one image is required to submit the form."
      );
      setTimeout(() => setReportSubmitError(null), 3000);
      return;
    }

    try {
      const res = await fetch("/api/items/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setReportSubmitError(data.message);
        return;
      }

      setReportSuccess("Item reported successfully!");
      setTimeout(() => navigate("/dashboard?tab=found-items"), 3000);

      setFormData({
        item: "",
        dateFound: new Date(),
        location: "",
        description: "",
        category: "",
        imageUrls: [],
        department: "",
        foundByName: "",
        staffInvolved: "",
      });
      setFiles([]);
      setKey((prevKey) => prevKey + 1);
    } catch (error) {
      setReportSubmitError("Something went wrong");
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
        <TextInput
          type="text"
          placeholder="Item Found"
          required
          name="item"
          onChange={handleChange}
          value={formData.item}
        />
        <Select
          name="category"
          required
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
        <TextInput
          type="text"
          placeholder="Location Found"
          required
          name="location"
          onChange={handleChange}
        />
        <TextInput
          type="text"
          placeholder="Name of the person who found the item"
          required
          name="foundByName"
          onChange={handleChange}
          value={formData.foundByName}
        />
        <TextInput
          type="text"
          placeholder="Enter staff name"
          required
          name="staffInvolved"
          onChange={handleChange}
          value={formData.staffInvolved}
        />
        <textarea
          className="block w-full p-2.5 text-sm"
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
            accept="image/*"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            disabled={formData.imageUrls.length >= 5}
          />
          <Button type="button" onClick={handleImageSubmit}>
            Upload Image
          </Button>
          <Button type="button" onClick={() => setShowWebcam(!showWebcam)}>
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
            <Button type="button" onClick={handleCapture} className="mt-2">
              Capture Image
            </Button>
          </div>
        )}

        {imageUploadError && <Alert color="failure">{imageUploadError}</Alert>}
        {formData.imageUrls.length > 0 && (
          <div className="flex space-x-4">
            {formData.imageUrls.map((url, index) => (
              <div key={url} className="flex flex-col items-center">
                <img
                  src={url}
                  alt={`listing ${index}`}
                  className="w-24 h-24 object-contain"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prevFormData) => ({
                      ...prevFormData,
                      imageUrls: prevFormData.imageUrls.filter(
                        (_, i) => i !== index
                      ),
                    }))
                  }
                  className="mt-3 text-red-600 hover:text-red-800"
                >
                  <HiOutlineTrash className="w-6 h-6" />
                </button>
              </div>
            ))}
          </div>
        )}
        <Button type="submit">Submit Found Item</Button>
        {reportSuccess && <Alert color="success">{reportSuccess}</Alert>}
        {reportSubmitError && <Alert color="failure">{reportSubmitError}</Alert>}
      </form>
    </div>
  );
}