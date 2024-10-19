import React, { useState, useEffect } from "react";
import { Modal, TextInput, Button, Radio, Label } from "flowbite-react";

const offices = ["SSO", "SSG", "SSD"]; // Office options

const TurnoverModal = ({ isOpen, onClose, onSave, itemToEdit }) => {
  const [formData, setFormData] = useState({
    turnoverDate: "",
    turnoverPerson: "",
    department: itemToEdit?.department || "SSO", // Initialize with the current department or default
  });

  // Use effect to populate the form data if editing turnover
  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        turnoverDate: itemToEdit.turnoverDate || "",
        turnoverPerson: itemToEdit.turnoverPerson || "",
        department: itemToEdit.department || "SSO", // Populate with existing department
      });
    }
  }, [itemToEdit]);

  // Update form data based on the changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleRadioChange = (e) => {
    setFormData((prevData) => ({ ...prevData, department: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Pass the form data including the updated department
      await onSave({
        turnoverDate: formData.turnoverDate,
        turnoverPerson: formData.turnoverPerson,
        department: formData.department, // Include updated department (office stored)
      });
      onClose(); // Close modal after save
    } catch (error) {
      console.error("Failed to save turnover data:", error);
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
        body: JSON.stringify(turnoverData), // Includes turnoverDate, turnoverPerson, and department
      });

      if (!response.ok) {
        throw new Error("Failed to save turnover information");
      }

      const updatedItem = await response.json(); // Get the updated item from the backend
      console.log("Updated item:", updatedItem); // Debugging log

      // Update the state to reflect the updated turnover details immediately
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
    <Modal show={isOpen} onClose={onClose} size="md">
      <Modal.Header>Record Turnover Information</Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-6 gap-6">
            {/* Turnover Date */}
            <div className="col-span-6">
              <label
                htmlFor="turnoverDate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Turnover Date
              </label>
              <TextInput
                type="date"
                name="turnoverDate"
                id="turnoverDate"
                className="block w-full p-2.5 border rounded-lg shadow-sm"
                value={formData.turnoverDate}
                onChange={handleChange}
                required
              />
            </div>

            {/* Turnover Person */}
            <div className="col-span-6">
              <label
                htmlFor="turnoverPerson"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Turnover Person
              </label>
              <TextInput
                type="text"
                name="turnoverPerson"
                id="turnoverPerson"
                className="block w-full p-2.5 border rounded-lg shadow-sm"
                placeholder="Enter turnover person"
                value={formData.turnoverPerson}
                onChange={handleChange}
                required
              />
            </div>

            {/* Office Stored (department) - Editable during turnover */}
            <div className="col-span-6">
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
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" gradientDuoTone="purpleToBlue">
              Save Turnover Info
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default TurnoverModal;
