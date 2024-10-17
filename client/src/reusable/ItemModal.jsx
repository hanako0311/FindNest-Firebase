import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  TextInput,
  Button,
  Radio,
  Label,
  FileInput,
  Alert,
} from "flowbite-react";
import {
  HiCheckCircle,
  HiXCircle,
  HiOutlineExclamationCircle,
  HiPlus,
  HiPencilAlt,
  HiTrash,
  HiOutlineTrash,
} from "react-icons/hi";
import Webcam from "react-webcam";
import { useSelector } from "react-redux";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../firebase";

const offices = ["SSO", "SSG", "SSD"];

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

const ItemModal = ({ isOpen, onClose, onSave, itemToEdit }) => {
  const [files, setFiles] = useState([]);
  const [webcamImage, setWebcamImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    item: "",
    dateFound: "",
    location: "",
    description: "",
    imageUrls: [],
    category: "Other",
    status: "Available",
    claimantName: "",
    claimedDate: "",
    department: "SSO",
    userRef: currentUser?.id,
    turnoverDate: "", // Added turnoverDate
    turnoverPerson: "", // Added turnoverPerson
  });
  const webcamRef = useRef(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        item: itemToEdit.item || "",
        dateFound: itemToEdit.dateFound
          ? new Date(itemToEdit.dateFound).toISOString().split("T")[0]
          : "",
        location: itemToEdit.location || "",
        description: itemToEdit.description || "",
        imageUrls: itemToEdit.imageUrls || [],
        category: itemToEdit.category || "Other",
        status: itemToEdit.status || "Available",
        claimantName: itemToEdit.claimantName || "",
        claimedDate: itemToEdit.claimedDate || "",
        department: itemToEdit.department || "SSO",
        userRef: itemToEdit.userRef || currentUser?.id,
        turnoverDate: itemToEdit.turnoverDate || "", // Added turnoverDate
        turnoverPerson: itemToEdit.turnoverPerson || "", // Added turnoverPerson
      });
    } else {
      resetForm();
    }
  }, [itemToEdit, currentUser]);

  const resetForm = () => {
    setFormData({
      item: "",
      dateFound: "",
      location: "",
      description: "",
      imageUrls: [],
      category: "Other",
      status: "Available",
      claimantName: "",
      claimedDate: "",
      department: "SSO",
      userRef: currentUser?.id,
      turnoverDate: "", // Reset turnoverDate
      turnoverPerson: "", // Reset turnoverPerson
    });
    setFiles([]);
    setWebcamImage(null);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const captureWebcamImage = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setWebcamImage(imageSrc);
  }, [webcamRef, setWebcamImage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleRadioChange = (e) => {
    setFormData((prevData) => ({ ...prevData, department: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedFormData = {
      ...formData,
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSave(updatedFormData, itemToEdit?.id);
      setSuccessMessage(
        itemToEdit ? "Item updated successfully!" : "Item saved successfully!"
      );
      resetForm();
      onClose();
    } catch (error) {
      setErrorMessage("Failed to save item. Please try again.");
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleImageSubmit = async () => {
    if (files.length > 0 && files.length + formData.imageUrls.length <= 5) {
      const promises = [];
      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }

      try {
        const urls = await Promise.all(promises);
        setFormData((prev) => ({
          ...prev,
          imageUrls: prev.imageUrls.concat(urls),
        }));
        setImageUploadError(false);
      } catch (err) {
        setImageUploadError(
          "Image upload failed: Each image must be less than 2MB."
        );
      }
    } else {
      setImageUploadError("You can only upload up to 5 images per item.");
    }
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
          console.error("Upload error:", error.message);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              resolve(downloadURL);
            })
            .catch((error) => {
              console.error("Failed to get download URL:", error.message);
              reject(error);
            });
        }
      );
    });
  };

  const uploadWebcamImage = async () => {
    if (webcamImage && formData.imageUrls.length < 5) {
      const blob = await fetch(webcamImage).then((res) => res.blob());
      const file = new File([blob], "webcam.jpg", { type: "image/jpeg" });
      try {
        const url = await storeImage(file);
        setFormData((prev) => ({
          ...prev,
          imageUrls: [...prev.imageUrls, url],
        }));
        setWebcamImage(null);
        setImageUploadError(false);
      } catch (err) {
        setImageUploadError("Webcam image upload failed.");
      }
    } else {
      setImageUploadError("You can only upload up to 5 images per item.");
    }
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return (
    <Modal show={isOpen} onClose={onClose} size="2xl">
      <Modal.Header>{itemToEdit ? "Edit Item" : "Add New Item"}</Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="item"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Item Name
              </label>
              <input
                type="text"
                name="item"
                id="item"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Item Name"
                value={formData.item}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="dateFound"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Date Found
              </label>
              <input
                type="date"
                name="dateFound"
                id="dateFound"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                value={formData.dateFound}
                onChange={handleChange}
                required
                disabled={!!itemToEdit} // Disable when editing
              />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="location"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Location
              </label>
              <input
                type="text"
                name="location"
                id="location"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="turnoverDate" // Added turnoverDate field
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Turnover Date
              </label>
              <TextInput
                type="date"
                name="turnoverDate"
                id="turnoverDate"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                value={formData.turnoverDate}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="turnoverPerson" // Added turnoverPerson field
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Turnover Person
              </label>
              <TextInput
                type="text"
                name="turnoverPerson"
                id="turnoverPerson"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Enter the name of the turnover person"
                value={formData.turnoverPerson}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="category"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Category
              </label>
              <select
                name="category"
                id="category"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="department"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Office Stored
              </label>
              <div className="flex flex-col">
                {offices.map((office) => (
                  <div key={office} className="flex items-center mb-2">
                    <Radio
                      id={office}
                      name="department"
                      value={office}
                      checked={formData.department === office}
                      onChange={handleRadioChange}
                      className="mr-2"
                    />
                    <Label htmlFor={office}>{office}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-6">
              <label
                htmlFor="imageUrls"
                className="block mb-2 text-sm font-medium text.text-gray-900 dark:text-white"
              >
                Image URLs
              </label>
              <FileInput
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files))}
                disabled={formData.imageUrls.length >= 5}
              />
              <Button
                type="button"
                gradientDuoTone="pinkToOrange"
                onClick={handleImageSubmit}
                disabled={files.length === 0} // Disable button if no files selected
                className="mt-2"
              >
                Upload Images
              </Button>
              {imageUploadError && (
                <Alert color="failure" className="mt-2">
                  {imageUploadError}
                </Alert>
              )}
              {formData.imageUrls.length >= 5 && (
                <Alert color="warning" className="mt-2">
                  Number of images is already at the maximum.
                </Alert>
              )}

              {formData.imageUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Item ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Button
                type="button"
                gradientDuoTone="pinkToOrange"
                onClick={() => setShowWebcam((prev) => !prev)}
                className="mt-4"
              >
                {showWebcam ? "Close Webcam" : "Open Webcam"}
              </Button>
              {showWebcam && (
                <div className="mt-4">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-64 border-2 border-gray-300 rounded-lg"
                  />
                  <div className="mt-2 flex space-x-2">
                    <Button
                      type="button"
                      gradientDuoTone="pinkToOrange"
                      onClick={captureWebcamImage}
                    >
                      Capture Image
                    </Button>
                    {webcamImage && (
                      <Button
                        type="button"
                        gradientDuoTone="pinkToOrange"
                        onClick={uploadWebcamImage}
                      >
                        Upload Webcam Image
                      </Button>
                    )}
                  </div>
                </div>
              )}
              {webcamImage && (
                <div className="mt-4">
                  <img
                    src={webcamImage}
                    alt="Captured"
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              gradientDuoTone="pinkToOrange"
              className="w-full sm:w-auto"
            >
              {itemToEdit ? "Save Changes" : "Save Item"}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default ItemModal;
