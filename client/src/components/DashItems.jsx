import React, { useState, useEffect } from "react";
import { Table, Button, TextInput, Toast, Modal, Select } from "flowbite-react";
import {
  HiCheckCircle,
  HiXCircle,
  HiPlus,
  HiPencilAlt,
  HiTrash,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { AiOutlineSearch } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import ItemModal from "../reusable/ItemModal";

export default function DashItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All Items"); // Default to 'All Items'
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [itemToEdit, setItemToEdit] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  const navigate = useNavigate(); // Use navigate to switch views

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items");
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Fetched items:", data);
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  // Filter logic with buttons instead of dropdown
  const filteredItems = items
    .filter((item) => {
      if (filter === "All Items") {
        return true; // Show all items
      }
      return filter === "Unclaimed Items"
        ? item.status === "Available"
        : item.status === "Claimed";
    })
    .filter((item) =>
      item.item.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleSave = async (item, id) => {
    try {
      const url = id ? `/api/items/${id}` : "/api/items/save";
      const method = id ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error("Failed to save item");
      }

      const result = await response.json();
      console.log("Item saved:", result);
      setSuccessMessage(
        id ? "Item updated successfully." : "Item added successfully."
      );
      setIsModalOpen(false);
      fetchItems();
    } catch (error) {
      console.error("Error saving item:", error);
      setErrorMessage("Error saving item.");
    }
  };

  const handleDeleteItem = async () => {
    try {
      const response = await fetch(`/api/items/${itemToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      setSuccessMessage("Item deleted successfully.");
      setShowDeleteModal(false);
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      setErrorMessage("Error deleting item.");
    }
  };

  const handleViewChange = (e) => {
    const selectedView = e.target.value;

    if (selectedView === "DashItems") {
      navigate("/dashboard?tab=crud-items"); // Navigate back to the current page
    } else if (selectedView === "FoundItems") {
      navigate("/dashboard?tab=found-items"); // Navigate to the DashFoundItems page
    }
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

        <div className="flex items-center space-x-4">
          {/* View Switch Dropdown */}
          <Select
            value="DashItems" // Set the initial value to the current view
            onChange={handleViewChange}
            className="w-48"
          >
            <option value="DashItems">Items View</option>
            <option value="FoundItems">Found Items View</option>{" "}
            {/* Option for DashFoundItems */}
          </Select>

          <TextInput
            type="text"
            placeholder="Search..."
            rightIcon={AiOutlineSearch}
            className="w-full sm:w-96"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex mb-4 space-x-3">
        <Button
          color={filter === "All Items" ? "blue" : "gray"}
          onClick={() => setFilter("All Items")}
        >
          All Items
        </Button>
        <Button
          color={filter === "Unclaimed Items" ? "blue" : "gray"}
          onClick={() => setFilter("Unclaimed Items")}
        >
          Unclaimed Items
        </Button>
        <Button
          color={filter === "Claimed Items" ? "blue" : "gray"}
          onClick={() => setFilter("Claimed Items")}
        >
          Claimed Items
        </Button>

        <Button
          color="blue"
          className="ml-auto"
          onClick={() => setIsModalOpen(true)}
        >
          <HiPlus className="w-5 h-5" />
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

            {/* Conditionally display Claimant and Claimed Date columns for Claimed Items */}
            {filter === "Claimed Items" && (
              <>
                <Table.HeadCell>Claimant</Table.HeadCell>
                <Table.HeadCell>Claimant Image</Table.HeadCell>
                <Table.HeadCell>Claimed Date</Table.HeadCell>
              </>
            )}

            {/* Conditionally display Actions column for Unclaimed Items */}
            {filter === "Unclaimed Items" && (
              <Table.HeadCell>Actions</Table.HeadCell>
            )}
          </Table.Head>

          <Table.Body className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
            {filteredItems.map((item) => (
              <Table.Row
                key={item.id}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Table.Cell className="px-6 py-4">{item.item}</Table.Cell>
                <Table.Cell className="px-6 py-4">
                  <img
                    className="w-24 h-auto"
                    src={item.imageUrls && item.imageUrls[0]}
                    alt={item.item}
                  />
                </Table.Cell>
                <Table.Cell className="px-6 py-4">
                  {item.description}
                </Table.Cell>
                <Table.Cell className="px-6 py-4">{item.location}</Table.Cell>
                <Table.Cell className="px-6 py-4">{item.category}</Table.Cell>
                <Table.Cell className="px-6 py-4">{item.dateFound}</Table.Cell>
                <Table.Cell className="px-6 py-4">{item.department}</Table.Cell>
                <Table.Cell className="px-6 py-4">{item.status}</Table.Cell>

                {/* Render Claimant and Claimed Date for Claimed Items */}
                {filter === "Claimed Items" && (
                  <>
                    <Table.Cell className="px-6 py-4">
                      {item.claimantName}
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4">
                      {item.claimantImage && (
                        <img
                          src={item.claimantImage}
                          alt="Claimant"
                          className="w-16 h-16 rounded-lg"
                          onClick={() => {
                            setCurrentImageUrl(item.claimantImage);
                            setImageModalOpen(true);
                          }}
                        />
                      )}
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4">
                      {item.claimedDate}
                    </Table.Cell>
                  </>
                )}

                {/* Render Actions only for Unclaimed Items */}
                {filter === "Unclaimed Items" &&
                  item.status === "Available" && (
                    <Table.Cell className="px-6 py-4">
                      <div className="flex items-center ml-auto space-x-2 sm:space-x-3">
                        <Button
                          color="blue"
                          onClick={() => {
                            setItemToEdit(item);
                            setIsModalOpen(true);
                          }}
                        >
                          <HiPencilAlt className="w-4 h-4" />
                        </Button>
                        <Button
                          color="failure"
                          onClick={() => {
                            setItemToDelete(item);
                            setShowDeleteModal(true);
                          }}
                        >
                          <HiTrash className="w-4 h-4" />
                        </Button>
                      </div>
                    </Table.Cell>
                  )}

                {/* If no action is required, hide the last cell */}
                {(filter !== "Unclaimed Items" ||
                  item.status !== "Available") && (
                  <Table.Cell colSpan={1} className="hidden" />
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      <Modal show={isImageModalOpen} onClose={() => setImageModalOpen(false)}>
        <Modal.Header />
        <Modal.Body>
          <img
            src={currentImageUrl}
            alt="Enlarged claimant"
            className="w-full h-auto"
            style={{ maxWidth: "100%" }}
          />
        </Modal.Body>
      </Modal>

      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
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
              <Button color="gray" onClick={() => setShowDeleteModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <ItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        itemToEdit={itemToEdit}
      />
    </div>
  );
}
