import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { TextInput, Select } from "flowbite-react";
import {
  AiOutlineSearch,
  AiOutlineCalendar,
  AiOutlineClose,
} from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ItemDetailsPage from "../pages/ItemDetailsPage";

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

export default function DashFoundItem() {
  const { currentUser } = useSelector((state) => state.user);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDateRange, setShowDateRange] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null); // For modal item
  const [showModal, setShowModal] = useState(false); // To control modal visibility
  const dateRangeRef = useRef();
  const navigate = useNavigate(); // For navigation between views

  // Fetch items on initial load
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

      // Filter both 'unclaimed' and 'available' items
      const unclaimedAndAvailableItems = data.filter(
        (item) =>
          !item.status || // Show items without a status
          item.status.toLowerCase() === "unclaimed" || // Show unclaimed items
          item.status.toLowerCase() === "available" // Show available items
      );

      // Sort items by dateFound in descending order (newest first)
      const sortedItems = unclaimedAndAvailableItems.sort((a, b) => {
        const dateA = new Date(a.dateFound);
        const dateB = new Date(b.dateFound);
        return dateB - dateA; // Newest first
      });

      setItems(sortedItems); // Set sorted items
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  // Filter items based on search, category, and date range
  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const addOneDay = (date) => {
      const result = new Date(date);
      result.setDate(result.getDate() + 1);
      return result;
    };

    const filtered = items.filter((item) => {
      const matchesSearchTerm =
        item.item.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.category.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.location.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.description.toLowerCase().includes(lowerCaseSearchTerm) ||
        new Date(item.dateFound)
          .toLocaleDateString()
          .includes(lowerCaseSearchTerm);
      const matchesCategory = selectedCategory
        ? item.category.toLowerCase() === selectedCategory.toLowerCase()
        : true;
      const matchesDateRange =
        (!startDate || new Date(item.dateFound) >= startDate) &&
        (!endDate || new Date(item.dateFound) < addOneDay(endDate));
      return matchesSearchTerm && matchesCategory && matchesDateRange;
    });

    setFilteredItems(filtered);
  }, [searchTerm, selectedCategory, startDate, endDate, items]);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const clearDateRange = () => {
    setStartDate(null);
    setEndDate(null);
    setShowDateRange(false);
  };

  // Open the modal with the selected item's ID
  const handleOpenModal = (itemId) => {
    setSelectedItemId(itemId);
    setShowModal(true);
  };

  // Close the modal and reset selected item
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItemId(null);
  };

  // Handle the switch between DashFoundItems and DashItems views
  const handleViewChange = (e) => {
    const selectedView = e.target.value;

    if (selectedView === "DashItems") {
      navigate("/dashboard?tab=crud-items"); // Navigate to DashItems
    } else if (selectedView === "FoundItems") {
      navigate("/dashboard?tab=found-items"); // Navigate to DashFoundItems
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-screen p-6">
      {/* Title Header */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Found Items
        </h1>
      </div>

      {/* Container for Search, Category, Date Range, and View Switch */}
      <form
        onSubmit={handleSubmit}
        className="w-full mb-6 flex flex-wrap md:flex-row md:space-x-4 space-y-4 md:space-y-0 items-center p-4 rounded-md bg-white dark:bg-gray-800"
      >
        {/* Shortened Search Bar */}
        <TextInput
          type="text"
          placeholder="Search..."
          rightIcon={AiOutlineSearch}
          className="flex-1 p-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Category Filter */}
        <Select
          className="flex-1 p-2"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>

        {/* Date Range Filter */}
        <div className="relative flex-1">
          <button
            type="button"
            className="w-full flex justify-between items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2"
            onClick={() => setShowDateRange(!showDateRange)}
          >
            <span>Sort By Date</span>
            <AiOutlineCalendar />
          </button>
          {showDateRange && (
            <div
              ref={dateRangeRef}
              className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10"
            >
              <div className="p-4 space-y-4 relative">
                <button
                  type="button"
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  onClick={clearDateRange}
                >
                  <AiOutlineClose />
                </button>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="From Date"
                  className="w-full p-2 mt-3 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="To Date"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* View Switch Dropdown */}
        <Select
          className="flex-1 p-2"
          value="FoundItems" // Set the initial value to the current view
          onChange={handleViewChange}
        >
          <option value="FoundItems">Found Items View</option>
          <option value="DashItems">Items View</option>
        </Select>
      </form>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden dark:bg-gray-800 dark:border-gray-700"
            onClick={() => handleOpenModal(item.id)} // Open modal on click
          >
            <div className="aspect-w-1 aspect-h-1 sm:aspect-w-4 sm:aspect-h-3 w-full overflow-hidden">
              {item.imageUrls && item.imageUrls[0] ? (
                <img
                  src={item.imageUrls[0]}
                  alt={item.item}
                  className="h-full w-full object-contain object-center"
                  onError={(e) => {
                    e.target.onError = null; // Prevents looping
                    e.target.src = "/default-image.png"; // Specify your default image URL here
                  }}
                />
              ) : (
                <img
                  src="/default-image.png" // Specify your default image URL here
                  alt="Default"
                  className="h-full w-full object-cover object-center"
                />
              )}
            </div>
            <div className="px-5 py-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.dateFound).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full uppercase font-semibold ${
                    item.status.toLowerCase() === "claimed"
                      ? "bg-green-500 text-white"
                      : "bg-red-800 text-white"
                  }`}
                >
                  {item.status.toLowerCase() === "claimed"
                    ? "Claimed"
                    : "Unclaimed"}
                </span>
              </div>
              <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                {item.item}
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {item.description}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Found at {item.location}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for item details */}
      {selectedItemId && (
        <ItemDetailsPage
          id={selectedItemId}
          isOpen={showModal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
