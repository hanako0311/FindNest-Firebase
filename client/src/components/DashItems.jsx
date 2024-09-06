import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Table,
  Button,
  Select,
  TextInput,
  Toast,
  Modal,
} from "flowbite-react";
import {
  HiCheckCircle,
  HiXCircle,
  HiPlus,
  HiPencilAlt,
  HiTrash,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { AiOutlineSearch } from "react-icons/ai";
import { Link } from "react-router-dom";
import ItemModal from "../reusable/ItemModal";

export default function DashItems() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("Unclaimed Items");
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [itemToEdit, setItemToEdit] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

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

    const filteredItems = items.filter((item) =>
        filter === "Unclaimed Items"
        ? item.status === "Available"
        : item.status === "Claimed"
        
    ).filter((item) =>
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select
          color="gray"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="Unclaimed Items">Unclaimed Items</option>
          <option value="Claimed Items">Claimed Items</option>
        </Select>

        <Button
          color="blue"
          className="ml-3"
          onClick={() => setIsModalOpen(true)}
        >
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
            {filter === "Claimed Items" && (
              <>
                <Table.HeadCell>Claimant</Table.HeadCell>
                <Table.HeadCell>Claimed Date</Table.HeadCell>
                <Table.HeadCell> </Table.HeadCell>
              </>
            )}
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
                <Table.Cell className="px-6 py-4">
                  <Link className="font-bold">{item.item}</Link>
                </Table.Cell>
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
                {filter === "Claimed Items" && (
                  <>
                    <Table.Cell className="px-6 py-4">
                      {item.claimantName}
                    </Table.Cell>
                    <Table.Cell className="px-6 py-4">
                      {item.claimedDate}
                    </Table.Cell>
                  </>
                )}

                <Table.Cell className="px-6 py-4">
                  {item.status === "Available" && (
                    <div className="flex items-center ml-auto space-x-2 sm:space-x-3">
                      <Button
                        color="blue"
                        onClick={() => {
                          setItemToEdit(item);
                          setIsModalOpen(true);
                        }}
                      >
                        <HiPencilAlt className="w-4 h-4 mr-2" /> Edit
                      </Button>
                      <Button
                        color="failure"
                        onClick={() => {
                          setItemToDelete(item);
                          setShowDeleteModal(true);
                        }}
                      >
                        <HiTrash className="w-4 h-4 mr-2" /> Delete
                      </Button>
                    </div>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

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
