import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  FileInput,
  Select,
  TextInput,
  Alert,
  Toast,
  Radio,
  Label,
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
import { AiOutlineSearch } from "react-icons/ai";
import { Link } from "react-router-dom";
import Webcam from "react-webcam";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../firebase";
import { useSelector } from "react-redux";

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

const offices = ["SSO", "SSG", "SSD"];

export default function DashCrudItems() {
  const { currentUser } = useSelector((state) => state.user);
  const [items, setItems] = useState([]);
  const [claimedItems, setClaimedItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState("");
  const [itemToEdit, setItemToEdit] = useState({
    item: "",
    dateFound: "",
    location: "",
    description: "",
    imageUrls: [],
    category: "Other",
    status: "available",
    claimantName: "",
    claimedDate: "",
    department: "SSO",
    turnoverDate: "", // Added field for turnoverDate
    turnoverPerson: "", // Added field for turnoverPerson
  });
  const [files, setFiles] = useState([]);
  const [webcamImage, setWebcamImage] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [view, setView] = useState("All Items");

  const webcamRef = useRef(null);
  const [showWebcam, setShowWebcam] = useState(false);

  const captureWebcamImage = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setWebcamImage(imageSrc);
  }, [webcamRef, setWebcamImage]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/items/getItems", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        // Set all items
        setItems(data);

        // Filter and sort based on the view
        if (view === "All Items") {
          const sortedItems = [...data].sort(
            (a, b) => new Date(b.dateFound) - new Date(a.dateFound)
          );
          setFilteredItems(sortedItems);
        } else if (view === "Unclaimed Items") {
          const unclaimedItems = data.filter(
            (item) => item.status === "available"
          );
          const sortedUnclaimedItems = unclaimedItems.sort(
            (a, b) => new Date(b.dateFound) - new Date(a.dateFound)
          );
          setFilteredItems(sortedUnclaimedItems);
        } else if (view === "Claimed Items") {
          const claimedItems = data.filter((item) => item.status === "claimed");
          const sortedClaimedItems = claimedItems.sort(
            (a, b) => new Date(b.claimedDate) - new Date(a.claimedDate)
          );
          setFilteredItems(sortedClaimedItems);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, [view]);

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const itemsToFilter = view === "All Items" ? items : claimedItems;
    const filtered = itemsToFilter.filter((item) => {
      const matchesSearchTerm =
        item.item.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.category.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.location.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.description
          .toLowerCase()
          .toLowerCase()
          .includes(lowerCaseSearchTerm) ||
        item.department?.toLowerCase().includes(lowerCaseSearchTerm) ||
        new Date(item.dateFound)
          .toLocaleDateString()
          .includes(lowerCaseSearchTerm);
      const matchesCategory = selectedCategory
        ? item.category.toLowerCase() === selectedCategory.toLowerCase()
        : true;
      return matchesSearchTerm && matchesCategory;
    });
    setFilteredItems(filtered);
  }, [searchTerm, selectedCategory, items, claimedItems, view]);

  const handleDeleteItem = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/items/deleteItem/${itemIdToDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item._id !== itemIdToDelete));
        setClaimedItems((prev) =>
          prev.filter((item) => item._id !== itemIdToDelete)
        );
        setFilteredItems((prev) =>
          prev.filter((item) => item._id !== itemIdToDelete)
        );
        setShowModal(false);
        setSuccessMessage("Item deleted successfully.");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(data.message);
        setTimeout(() => setErrorMessage(""), 3000);
      }
    } catch (error) {
      setErrorMessage("Error deleting item.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleImageSubmit = async () => {
    if (files.length > 0 && files.length + itemToEdit.imageUrls.length <= 5) {
      const promises = [];
      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }

      try {
        const urls = await Promise.all(promises);
        setItemToEdit((prev) => ({
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

  const uploadWebcamImage = async () => {
    if (webcamImage && itemToEdit.imageUrls.length < 5) {
      const blob = await fetch(webcamImage).then((res) => res.blob());
      const file = new File([blob], "webcam.jpg", { type: "image/jpeg" });
      try {
        const url = await storeImage(file);
        setItemToEdit((prev) => ({
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

  const handleRemoveImage = (index) => {
    setItemToEdit((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();

    const updatedItem = { ...itemToEdit };

    console.log("Item being saved:", updatedItem); // added for debugging

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `/api/items/${
          itemToEdit._id ? `updateItem/${itemToEdit._id}` : "report"
        }`,
        {
          method: itemToEdit._id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedItem),
        }
      );
      const data = await res.json();
      if (res.ok) {
        if (updatedItem.status === "claimed") {
          setClaimedItems((prev) =>
            updatedItem._id
              ? prev.map((item) => (item._id === updatedItem._id ? data : item))
              : [...prev, data]
          );
        } else {
          setItems((prev) =>
            updatedItem._id
              ? [data, ...prev.filter((item) => item._id !== updatedItem._id)]
              : [data, ...prev]
          );
        }
        setFilteredItems((prev) =>
          updatedItem._id
            ? prev.map((item) => (item._id === updatedItem._id ? data : item))
            : [data, ...prev]
        );
        setShowAddModal(false);
        setShowEditModal(false);
        setSuccessMessage(
          `Item ${updatedItem._id ? "updated" : "added"} successfully.`
        );
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(data.message);
        setTimeout(() => setErrorMessage(""), 3000);
      }
    } catch (error) {
      setErrorMessage("Error saving item.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleEditItem = (item) => {
    setItemToEdit({
      ...item,
      dateFound: new Date(item.dateFound).toISOString().split("T")[0],
      turnoverDate: item.turnoverDate || "", // Ensure turnoverDate is editable
      turnoverPerson: item.turnoverPerson || "", // Ensure turnoverPerson is editable
    });
    setShowEditModal(true);
  };

  const handleAddItem = () => {
    setItemToEdit({
      item: "",
      dateFound: "",
      location: "",
      description: "",
      imageUrls: [],
      category: "Other",
      status: "available",
      claimantName: "",
      claimedDate: "",
      department: "SSO",
      turnoverDate: "", // Added turnoverDate default empty value
      turnoverPerson: "", // Added turnoverPerson default empty value
    });
    setFiles([]);
    setShowAddModal(true);
  };

  const resetModalState = () => {
    setItemToEdit({
      item: "",
      dateFound: "",
      location: "",
      description: "",
      imageUrls: [],
      category: "Other",
      status: "available",
      claimantName: "",
      claimedDate: "",
      department: "SSO",
      turnoverDate: "", // Reset turnoverDate field
      turnoverPerson: "", // Reset turnoverPerson field
    });
    setFiles([]);
    setWebcamImage(null);
    setImageUploadError(false);
  };

  return (
    <div className="container mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500 overflow-x-auto">
      {/* Toast Messages */}
      {successMessage && (
        <Toast className="fixed top-4 right-4 z-50">
          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
            <HiCheckCircle className="h-5 w-5" />
          </div>
          <div className="ml-3 text-sm font-normal">{successMessage}</div>
          <Toast.Toggle />
        </Toast>
      )}
      {errorMessage && (
        <Toast className="fixed top-4 right-4 z-50">
          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
            <HiXCircle className="h-5 w-5" />
          </div>
          <div className="ml-3 text-sm font-normal">{errorMessage}</div>
          <Toast.Toggle />
        </Toast>
      )}

      <div className="p-3 w-full overflow-x-auto flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
          Items
        </h1>
      </div>

      <div className="mb-4 w-full flex items-center justify-between">
        <div className="flex-grow mr-4">
          <TextInput
            type="text"
            placeholder="Search..."
            rightIcon={AiOutlineSearch}
            className="w-full sm:w-96"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          color="gray"
          value={view}
          onChange={(e) => setView(e.target.value)}
        >
          <option value="All Items">All Items</option>
          <option value="Unclaimed Items">Unclaimed Items</option>
          <option value="Claimed Items">Claimed Items</option>
        </Select>

        <Button onClick={handleAddItem} color="blue" className="ml-3">
          <HiPlus className="w-5 h-5 mr-2 -ml-1" />
          Add Item
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table
          hoverable
          className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400"
        >
          <Table.Head className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <Table.HeadCell>Item Name</Table.HeadCell>
            <Table.HeadCell>Image</Table.HeadCell>
            <Table.HeadCell>Description</Table.HeadCell>
            <Table.HeadCell>Location</Table.HeadCell>
            <Table.HeadCell>Category</Table.HeadCell>
            <Table.HeadCell>Date Found</Table.HeadCell>
            <Table.HeadCell>Office Stored</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            {view === "Claimed Items" && (
              <Table.HeadCell>Claimant</Table.HeadCell>
            )}
            {view === "Claimed Items" && (
              <Table.HeadCell>Claimed Date</Table.HeadCell>
            )}
            {/* Add Turnover Date and Turnover Person for unclaimed items */}
            {view === "All Items" && (
              <>
                <Table.HeadCell>Turnover Date</Table.HeadCell>
                <Table.HeadCell>Turnover Person</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </>
            )}
          </Table.Head>
          <Table.Body className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
            {filteredItems.map((item) => (
              <Table.Row
                key={item._id}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Table.Cell className="px-6 py-4">
                  <Link to={`/item/${item._id}`} className="font-bold">
                    {item.item}
                  </Link>
                </Table.Cell>
                <Table.Cell className="px-6 py-4">
                  {item.imageUrls && item.imageUrls[0] && (
                    <img
                      src={item.imageUrls[0]}
                      alt={item.item}
                      className="w-24 h-32 object-cover object-center rounded-md"
                      onError={(e) => {
                        e.target.onError = null; // Prevents looping
                        e.target.src = "/default-image.png";
                      }}
                    />
                  )}
                </Table.Cell>
                <Table.Cell className="px-6 py-4">
                  {item.description}
                </Table.Cell>
                <Table.Cell className="px-6 py-4">{item.location}</Table.Cell>
                <Table.Cell className="px-6 py-4">{item.category}</Table.Cell>
                <Table.Cell className="px-6 py-4">
                  {new Date(item.dateFound).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell className="px-6 py-4">{item.department}</Table.Cell>
                <Table.Cell className="px-6 py-4">{item.status}</Table.Cell>
                {view === "Claimed Items" && (
                  <Table.Cell className="px-6 py-4">
                    {item.claimantName}
                  </Table.Cell>
                )}
                {view === "Claimed Items" && (
                  <Table.Cell className="px-6 py-4">
                    {new Date(item.claimedDate).toLocaleDateString()}
                  </Table.Cell>
                )}
                {/* Add Turnover Date and Turnover Person fields for unclaimed items */}
                {view === "All Items" && (
                  <>
                    <Table.Cell className="px-6 py-4">
                      {item.turnoverDate
                        ? new Date(item.turnoverDate).toLocaleDateString()
                        : "-"}
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4">
                      {item.turnoverPerson || "-"}
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4">
                      <div className="flex items-center ml-auto space-x-2 sm:space-x-3">
                        <Button
                          onClick={() => handleEditItem(item)}
                          color="blue"
                        >
                          <HiPencilAlt className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button
                          color="failure"
                          onClick={() => {
                            setShowModal(true);
                            setItemIdToDelete(item._id);
                          }}
                        >
                          <HiTrash className="w-4 h-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </Table.Cell>
                  </>
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this item?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteItem}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Add Item Modal */}
      <Modal
        show={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetModalState();
        }}
        size="2xl"
      >
        <Modal.Header>Add new item</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSaveItem}>
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
                  value={itemToEdit.item}
                  onChange={(e) =>
                    setItemToEdit({ ...itemToEdit, item: e.target.value })
                  }
                  id="item"
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Item Name"
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
                  value={itemToEdit.dateFound}
                  onChange={(e) =>
                    setItemToEdit({ ...itemToEdit, dateFound: e.target.value })
                  }
                  id="dateFound"
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  required
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
                  value={itemToEdit.location}
                  onChange={(e) =>
                    setItemToEdit({ ...itemToEdit, location: e.target.value })
                  }
                  id="location"
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Location"
                  required
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="description"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={itemToEdit.description}
                  onChange={(e) =>
                    setItemToEdit({
                      ...itemToEdit,
                      description: e.target.value,
                    })
                  }
                  id="description"
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Description"
                  required
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
                  value={itemToEdit.category}
                  onChange={(e) =>
                    setItemToEdit({ ...itemToEdit, category: e.target.value })
                  }
                  id="category"
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
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
                        checked={itemToEdit.department === office}
                        onChange={(e) =>
                          setItemToEdit({
                            ...itemToEdit,
                            department: e.target.value,
                          })
                        }
                        className="mr-2"
                      />
                      <Label htmlFor={office}>{office}</Label>
                    </div>
                  ))}
                </div>
              </div>
              {/* Added fields for Turnover Date and Turnover Person */}
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="turnoverDate"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Turnover Date
                </label>
                <TextInput
                  type="date"
                  name="turnoverDate"
                  value={itemToEdit.turnoverDate}
                  onChange={(e) =>
                    setItemToEdit({
                      ...itemToEdit,
                      turnoverDate: e.target.value,
                    })
                  }
                  id="turnoverDate"
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="turnoverPerson"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Turnover Person
                </label>
                <TextInput
                  type="text"
                  name="turnoverPerson"
                  value={itemToEdit.turnoverPerson}
                  onChange={(e) =>
                    setItemToEdit({
                      ...itemToEdit,
                      turnoverPerson: e.target.value,
                    })
                  }
                  id="turnoverPerson"
                  placeholder="Turnover Person"
                />
              </div>
              {/* End of added fields */}
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
                  disabled={itemToEdit.imageUrls.length >= 5}
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
                {webcamImage && (
                  <Button
                    type="button"
                    gradientDuoTone="pinkToOrange"
                    onClick={uploadWebcamImage}
                    className="mt-2 ml-2"
                  >
                    Upload Webcam Image
                  </Button>
                )}
                {imageUploadError && (
                  <Alert color="failure" className="mt-2">
                    {imageUploadError}
                  </Alert>
                )}
                {itemToEdit.imageUrls.length >= 5 && (
                  <Alert color="warning" className="mt-2">
                    Number of images is already at the maximum.
                  </Alert>
                )}
                {itemToEdit.imageUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {itemToEdit.imageUrls.map((url, index) => (
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
                Save all
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetModalState();
        }}
        size="2xl"
      >
        <Modal.Header>Edit item</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSaveItem}>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="item"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Item Name
                </label>
                <TextInput
                  type="text"
                  name="item"
                  value={itemToEdit.item}
                  onChange={(e) =>
                    setItemToEdit({ ...itemToEdit, item: e.target.value })
                  }
                  id="item"
                  placeholder="Item Name"
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
                <TextInput
                  type="date"
                  name="dateFound"
                  value={itemToEdit.dateFound}
                  onChange={(e) =>
                    setItemToEdit({ ...itemToEdit, dateFound: e.target.value })
                  }
                  id="dateFound"
                  required
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="location"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Location
                </label>
                <TextInput
                  type="text"
                  name="location"
                  value={itemToEdit.location}
                  onChange={(e) =>
                    setItemToEdit({ ...itemToEdit, location: e.target.value })
                  }
                  id="location"
                  placeholder="Location"
                  required
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="description"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Description
                </label>
                <TextInput
                  type="text"
                  name="description"
                  value={itemToEdit.description}
                  onChange={(e) =>
                    setItemToEdit({
                      ...itemToEdit,
                      description: e.target.value,
                    })
                  }
                  id="description"
                  placeholder="Description"
                  required
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="category"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Category
                </label>
                <Select
                  name="category"
                  value={itemToEdit.category}
                  onChange={(e) =>
                    setItemToEdit({ ...itemToEdit, category: e.target.value })
                  }
                  id="category"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
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
                        checked={itemToEdit.department === office}
                        onChange={(e) =>
                          setItemToEdit({
                            ...itemToEdit,
                            department: e.target.value,
                          })
                        }
                        className="mr-2"
                      />
                      <Label htmlFor={office}>{office}</Label>
                    </div>
                  ))}
                </div>
              </div>
              {/* Added fields for Turnover Date and Turnover Person */}
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="turnoverDate"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Turnover Date
                </label>
                <TextInput
                  type="date"
                  name="turnoverDate"
                  value={itemToEdit.turnoverDate}
                  onChange={(e) =>
                    setItemToEdit({
                      ...itemToEdit,
                      turnoverDate: e.target.value,
                    })
                  }
                  id="turnoverDate"
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="turnoverPerson"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Turnover Person
                </label>
                <TextInput
                  type="text"
                  name="turnoverPerson"
                  value={itemToEdit.turnoverPerson}
                  onChange={(e) =>
                    setItemToEdit({
                      ...itemToEdit,
                      turnoverPerson: e.target.value,
                    })
                  }
                  id="turnoverPerson"
                  placeholder="Turnover Person"
                />
              </div>
              {/* End of added fields */}
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
                  disabled={itemToEdit.imageUrls.length >= 5}
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
                {webcamImage && (
                  <Button
                    type="button"
                    gradientDuoTone="pinkToOrange"
                    onClick={uploadWebcamImage}
                    className="mt-2 ml-2"
                  >
                    Upload Webcam Image
                  </Button>
                )}
                {imageUploadError && (
                  <Alert color="failure" className="mt-2">
                    {imageUploadError}
                  </Alert>
                )}
                {itemToEdit.imageUrls.length >= 5 && (
                  <Alert color="warning" className="mt-2">
                    Number of images is already at the maximum.
                  </Alert>
                )}
                {itemToEdit.imageUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {itemToEdit.imageUrls.map((url, index) => (
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
                Save all
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
