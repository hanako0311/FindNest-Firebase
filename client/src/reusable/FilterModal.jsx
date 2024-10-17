import React, { useState } from "react";
import {
  Modal,
  Button,
  Checkbox,
  Label,
  TextInput,
  Datepicker,
} from "flowbite-react";

const FilterModal = ({ show, onClose, onApplyFilters, clearFilters }) => {
  const [actionFilter, setActionFilter] = useState({
    found: false,
    claimed: false,
    deleted: false,
  });
  const [itemName, setItemName] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleActionChange = (e) => {
    setActionFilter({
      ...actionFilter,
      [e.target.name]: e.target.checked,
    });
  };

  const adjustDateForFiltering = (date, adjustByDays = 0) => {
    const adjustedDate = new Date(date);
    adjustedDate.setDate(adjustedDate.getDate() + adjustByDays);
    return adjustedDate;
  };

  const handleApplyFilters = () => {
    // Collect selected actions
    const selectedActions = [];
    if (actionFilter.found) selectedActions.push("Found");
    if (actionFilter.claimed) selectedActions.push("Claimed");
    if (actionFilter.deleted) selectedActions.push("Deleted");

    const adjustedStartDate = startDate
      ? adjustDateForFiltering(startDate, -1)
      : null;
    const adjustedEndDate = endDate ? adjustDateForFiltering(endDate, 0) : null; // Adjust end date to include entire day

    // Pass all filters
    onApplyFilters({
      action: selectedActions,
      name: itemName.trim() || null,
      dateRange: [adjustedStartDate, adjustedEndDate],
    });
    onClose();
  };

  const handleClearFilters = () => {
    setActionFilter({ found: false, claimed: false, deleted: false });
    setItemName("");
    setStartDate(null);
    setEndDate(null);
    clearFilters();
    onClose();
  };

  // Get today's date to disable future dates in the date pickers
  const today = new Date().toISOString().split("T")[0];

  return (
    <Modal show={show} size="lg" onClose={onClose}>
      <Modal.Header>Filter by Action</Modal.Header>
      <Modal.Body>
        {/* Action Filter */}
        <div className="flex flex-col space-y-2">
          <Label htmlFor="action">Action</Label>
          <div className="flex space-x-4">
            <Checkbox
              id="found"
              name="found"
              checked={actionFilter.found}
              onChange={handleActionChange}
            />
            <Label htmlFor="found">Found</Label>
            <Checkbox
              id="claimed"
              name="claimed"
              checked={actionFilter.claimed}
              onChange={handleActionChange}
            />
            <Label htmlFor="claimed">Claimed</Label>
            <Checkbox
              id="deleted"
              name="deleted"
              checked={actionFilter.deleted}
              onChange={handleActionChange}
            />
            <Label htmlFor="deleted">Deleted</Label>
          </div>
        </div>

        {/* Item Name Filter */}
        <div className="flex flex-col space-y-2 mt-4">
          <Label htmlFor="itemName">
            Item Name, Location, Department, Category
          </Label>
          <TextInput
            id="itemName"
            placeholder="Enter item name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)} // Update item name state
          />
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-col space-y-2 mt-4">
          <Label htmlFor="startDate">Start Date</Label>
          <input
            type="date"
            id="startDate"
            max={endDate || today} // Disable future dates and dates later than endDate
            value={startDate || ""} // Use an empty string if no date is selected
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Label htmlFor="endDate">End Date</Label>
          <input
            type="date"
            id="endDate"
            max={today} // Disable future dates
            min={startDate}
            value={endDate || ""} // Use an empty string if no date is selected
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={handleApplyFilters}
          className="bg-red-900 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          Apply Filters
        </Button>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
        <Button color="red" onClick={handleClearFilters}>
          Clear Filters
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FilterModal;
