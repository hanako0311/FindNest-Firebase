import React, { useState, useEffect } from "react";
import { Table, Button, TextInput, Toast, Modal, Select } from "flowbite-react";
import {
  HiCheckCircle,
  HiXCircle,
  HiPlus,
  HiPencilAlt,
  HiTrash,
  HiOutlineExclamationCircle,
  HiSwitchHorizontal,
} from "react-icons/hi";
import { AiOutlineSearch } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import ItemModal from "../reusable/ItemModal";
import TurnoverModal from "../reusable/TurnoverModal";

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
  const [isTurnoverModalOpen, setIsTurnoverModalOpen] = useState(false);

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
    setCurrentImageUrl(imageUrl);
    setImageModalOpen(true);
  };
  // Sort and filter logic
  const sortedItems = items
    .filter((item) => {
      // Filter items based on the selected tab (All, Unclaimed, Claimed)
      if (filter === "All Items") {
        return true; // Show all items
      }
      return filter === "Unclaimed Items"
        ? item.status === "Available"
        : item.status === "Claimed";
    })
    .filter((item) => {
      // Search across item name, description, location, category, and date found
      const searchTerm = searchQuery.toLowerCase();
      return (
        item.item.toLowerCase().includes(searchTerm) ||
        (item.description &&
          item.description.toLowerCase().includes(searchTerm)) ||
        (item.location && item.location.toLowerCase().includes(searchTerm)) ||
        (item.category && item.category.toLowerCase().includes(searchTerm)) ||
        (item.dateFound &&
          new Date(item.dateFound)
            .toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
            .toLowerCase()
            .includes(searchTerm))
      );
    });

  // Final sorted items logic
  const finalSortedItems = (() => {
    if (filter === "Claimed Items") {
      // Sort by claimed date for Claimed Items in descending order (most recent to oldest)
      return sortedItems.sort((a, b) => {
        if (!a.claimedDate) return 1; // Place items without claimedDate at the end
        if (!b.claimedDate) return -1; // Place items without claimedDate at the end
        return new Date(b.claimedDate) - new Date(a.claimedDate); // Sort descending (most recent first)
      });
    } else {
      // For All Items and Unclaimed Items, sort by dateFound in descending order (most recent to oldest)
      return sortedItems.sort((a, b) => {
        if (!a.dateFound) return 1; // Place items without dateFound at the end
        if (!b.dateFound) return -1; // Place items without dateFound at the end
        return new Date(b.dateFound) - new Date(a.dateFound); // Sort descending (most recent first)
      });
    }
  })();

  const handleSave = async (item, id) => {
    try {
      const url = id ? `/api/items/${id}` : "/api/items/save";
      const method = id ? "PUT" : "POST";
      console.log("Item being saved:", item); // Debugging log to check the item data
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

  const handleTurnoverSave = async (turnoverData) => {
    try {
      // PATCH request to update turnover data including department (Office Stored)
      const response = await fetch(`/api/items/${itemToEdit.id}/turnover`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(turnoverData), // Includes department field
      });

      if (!response.ok) {
        throw new Error("Failed to save turnover information");
      }

      const updatedItem = await response.json(); // Get the updated item from the backend
      console.log("Updated item:", updatedItem); // Debugging log

      // Update the state to reflect the updated department immediately
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        )
      );

      setSuccessMessage("Turnover information saved successfully.");
      setIsTurnoverModalOpen(false); // Close the modal after saving
    } catch (error) {
      console.error("Error saving turnover data:", error);
      setErrorMessage("Error saving turnover data.");
    }
  };

  return (
    <div className="container mx-auto p-3 overflow-x-auto">
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
            <option value="FoundItems">Found Items View</option>
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
      <div className="flex mb-4 space-x-2 p-3">
        <Button
          color={filter === "All Items" ? "red" : "gray"}
          onClick={() => setFilter("All Items")}
        >
          All Items
        </Button>
        <Button
          color={filter === "Unclaimed Items" ? "red" : "gray"}
          onClick={() => setFilter("Unclaimed Items")}
        >
          Unclaimed Items
        </Button>
        <Button
          color={filter === "Claimed Items" ? "red" : "gray"}
          onClick={() => setFilter("Claimed Items")}
        >
          Claimed Items
        </Button>

        <Button
          color="red"
          className="ml-auto"
          onClick={() => {
            setItemToEdit(null); // Clear itemToEdit to add a new item
            setIsModalOpen(true);
          }}
        >
          <HiPlus className="w-4 h-4" />
        </Button>
      </div>

      <div className="container mx-auto p-3 scrollbar overflow-x-auto">
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
            {filter === "Claimed Items" && (
              <>
                <Table.HeadCell>Claimant</Table.HeadCell>
                <Table.HeadCell>Claimant Image</Table.HeadCell>
                <Table.HeadCell>Claimed Date</Table.HeadCell>
              </>
            )}
            {filter === "Unclaimed Items" && (
              <>
                <Table.HeadCell>Turnover Date</Table.HeadCell>
                <Table.HeadCell>Turnover Person</Table.HeadCell>
              </>
            )}
            {filter === "Unclaimed Items" && (
              <Table.HeadCell>Actions</Table.HeadCell>
            )}
          </Table.Head>

          <Table.Body className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
            {sortedItems.map((item) => (
              <Table.Row
                key={item.id}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Table.Cell className="px-6 py-4">{item.item}</Table.Cell>
                <Table.Cell className="px-0 py-4">
                  {item.imageUrls && item.imageUrls[0] ? (
                    <img
                      src={item.imageUrls[0]}
                      alt={item.item}
                      className="w-24 h-24 rounded-md object-cover object-center"
                      onError={(e) => {
                        e.target.onError = null; // Prevents looping
                        e.target.src = "/default-image.png"; // Specify your default image URL here
                      }}
                    />
                  ) : (
                    <img
                      src="/default-image.png" // Specify your default image URL here
                      alt="Default"
                      className="w-24 h-24 rounded-md object-cover object-center"
                    />
                  )}
                </Table.Cell>

                <Table.Cell className="px-6 py-4">
                  {item.description}
                </Table.Cell>
                <Table.Cell className="px-6 py-4">{item.location}</Table.Cell>
                <Table.Cell className="px-6 py-4">{item.category}</Table.Cell>
                <Table.Cell className="px-6 py-4">
                  {item.dateFound
                    ? new Date(item.dateFound).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "-"}
                </Table.Cell>

                <Table.Cell className="px-6 py-4">
                  {item.department || "-"}
                </Table.Cell>
                <Table.Cell className="px-6 py-4">{item.status}</Table.Cell>

                {filter === "Claimed Items" && (
                  <>
                    <Table.Cell className="px-6 py-4">
                      {item.claimantName}
                    </Table.Cell>
                    <Table.Cell className="px-3 py-4">
                      {item.claimantImage && (
                        <img
                          src={item.claimantImage}
                          alt="Claimant"
                          className="w-24 h-24 rounded-md object-cover object-center cursor-pointer"
                          onClick={() => {
                            setCurrentImageUrl(item.claimantImage);
                            setImageModalOpen(true);
                          }}
                        />
                      )}
                    </Table.Cell>
                    <Table.Cell className="px-2 py-4">
                      {item.claimedDate
                        ? new Date(item.claimedDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "-"}
                    </Table.Cell>
                  </>
                )}

                {filter === "Unclaimed Items" && (
                  <>
                    <Table.Cell className="px-6 py-4">
                      {item.turnoverDate
                        ? new Date(item.turnoverDate).toLocaleDateString()
                        : "-"}
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4">
                      {item.turnoverPerson || "-"}
                    </Table.Cell>
                  </>
                )}

                {filter === "Unclaimed Items" &&
                  item.status === "Available" && (
                    <Table.Cell className="px-0 py-4">
                      <div className="flex items-center justify-center space-x-1">
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
                        {/* Add Turnover Button */}
                        <Button
                          color="purple"
                          onClick={() => {
                            console.log("Editing item:", item); // Add this line to debug
                            setItemToEdit(item);
                            // Open turnover modal (we'll create it soon)
                            setIsTurnoverModalOpen(true);
                          }}
                        >
                          <HiSwitchHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </Table.Cell>
                  )}

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

      {/* Include TurnoverModal */}
      <TurnoverModal
        isOpen={isTurnoverModalOpen}
        onClose={() => setIsTurnoverModalOpen(false)}
        onSave={handleTurnoverSave}
        itemToEdit={itemToEdit}
      />
    </div>
  );
}
