import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { TextInput, Select } from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AiOutlineSearch,
  AiOutlineCalendar,
  AiOutlineClose,
} from "react-icons/ai";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  const location = useLocation();
  const navigate = useNavigate();
  const dateRangeRef = useRef();

  // useEffect(() => {
  //   const fetchItems = async () => {
  //     try {
  //       const res = await fetch(
  //         `/api/items/getItems?userId=${currentUser._id}`
  //       );
  //       const data = await res.json();
  //       setItems(data);
  //       setFilteredItems(data);
  //       console.log("Fetched items:", data);
  //     } catch (error) {
  //       console.error("Error fetching items:", error);
  //     }
  //   };

  //   fetchItems();
  // }, [currentUser._id]);

     useEffect(() => {
       fetchItems();
     }, []);

     const fetchItems = async () => {
       try {
         const response = await fetch("/api/items");
         if (!response.ok) {
           throw new Error(
             `Network response was not ok: ${response.statusText}`
           );
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

    console.log("Filtered items:", filtered);
    setFilteredItems(filtered);
  }, [searchTerm, selectedCategory, startDate, endDate, items]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQuery = urlParams.toString();
    //  navigate(`/search?${searchQuery}`);
  };

  const clearDateRange = () => {
    setStartDate(null);
    setEndDate(null);
    setShowDateRange(false);
  };

  return (
    <div className="flex flex-col min-h-screen w-screen p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full mb-4 flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0"
      >
        <TextInput
          type="text"
          placeholder="Search..."
          rightIcon={AiOutlineSearch}
          className="w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          className="w-full md:w-1/3"
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
        <div className="relative w-full md:w-1/3">
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
              <div className="p-4 space-y-2 relative">
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
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden dark:bg-gray-800 dark:border-gray-700"
          >
            <Link to={`/item/${item.id}`}>
              <div className="aspect-w-1 aspect-h-1 sm:aspect-w-4 sm:aspect-h-3 w-full overflow-hidden">
                {item.imageUrls && item.imageUrls[0] ? (
                  <img
                    src={item.imageUrls[0]}
                    alt={item.item}
                    className="h-full w-full object-contain object-center"
                    onError={(e) => {
                      e.target.onError = null; // Prevents looping
                      e.target.src = "default-image.png"; // Specify your default image URL here
                    }}
                  />
                ) : (
                  <img
                    src="default-image.png" // Specify your default image URL here
                    alt="Default"
                    className="h-full w-full object-cover object-center"
                  />
                )}
              </div>
            </Link>
            <div className="px-5 py-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.dateFound).toLocaleDateString()}
                  </p>
                </div>
                <span className="bg-red-800 text-white text-xs px-2 py-1 rounded-full uppercase font-semibold">
                  {item.category}
                </span>
              </div>
              <Link to={`/item/${item._id}`} className="block mt-2">
                <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {item.item}
                </h5>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {item.description}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Found at the {item.location}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
