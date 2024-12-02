import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import { Button, Table } from "flowbite-react";
import {
  HiArrowNarrowUp,
  HiDocumentText,
  HiOutlineUserGroup,
  HiClipboardList,
  HiDownload,
} from "react-icons/hi";
import FilterModal from "../reusable/FilterModal";
import { generateReport } from "../reusable/ReportGenerator";

export default function DashAnalytics() {
  const [totalItemsReported, setTotalItemsReported] = useState(0);
  const [itemsClaimed, setItemsClaimed] = useState(0);
  const [itemsPending, setItemsPending] = useState(0);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [lastMonthUsers, setLastMonthUsers] = useState(0);
  const currentUser = useSelector((state) => state.user.currentUser);
  const [itemsFoundCount, setItemsFoundCount] = useState(Array(7).fill(0));
  const [itemsClaimedCount, setItemsClaimedCount] = useState(Array(7).fill(0));
  const [items, setItems] = useState([]);
  const [recentFoundItems, setRecentFoundItems] = useState([]);
  const [recentClaimedItems, setRecentClaimedItems] = useState([]);
  const [historicalItems, setHistoricalItems] = useState([]);
  const [filters, setFilters] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    console.log("Recent Found Items:", recentFoundItems);
    console.log("Recent Claimed Items:", recentClaimedItems);
  }, [recentFoundItems, recentClaimedItems]);

  const fetchItems = async () => {
    try {
      const res = await fetch(`/api/items`);
      const fetchedItems = await res.json();
      console.log("Fetched Items:", fetchedItems);

      let modifiedItems = [];
      const now = new Date();
      const foundCounts = Array(7).fill(0);
      const claimedCounts = Array(7).fill(0);

      let recentFound = [];
      let recentClaimed = [];

      fetchedItems.forEach((item) => {
        const createdAt = new Date(item.dateFound);
        const daysAgoFound = Math.floor(
          (now - createdAt) / (1000 * 60 * 60 * 24)
        );
        if (daysAgoFound < 7) {
          foundCounts[daysAgoFound]++;
          recentFound.push(item);
        }

        recentFound.sort(
          (a, b) =>
            new Date(b.createdAt || b.dateFound) -
            new Date(a.createdAt || a.dateFound)
        );
        if (recentFound.length > 5) {
          recentFound = recentFound.slice(0, 5);
        }

        if (item.status === "Claimed" && item.claimedDate) {
          const claimedDate = new Date(item.claimedDate);
          const daysAgoClaimed = Math.floor(
            (now - claimedDate) / (1000 * 60 * 60 * 24)
          );
          if (daysAgoClaimed < 7) {
            claimedCounts[daysAgoClaimed]++;
            recentClaimed.push(item);
          }
        }

        recentClaimed.sort(
          (a, b) => new Date(b.claimedDate) - new Date(a.claimedDate)
        );
        if (recentClaimed.length > 5) {
          recentClaimed = recentClaimed.slice(0, 5);
        }

        modifiedItems.push({
          ...item,
          key: `${item.id}-Found`,
          action: "Found",
          displayDate: new Date(
            item.dateFound || item.createdAt
          ).toLocaleDateString(),
          displayTime: new Date(
            item.dateFound || item.createdAt
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sortDate: new Date(item.dateFound || item.createdAt),
        });

        // Add claimed items with a valid date
        if (item.status === "Claimed" && item.claimedDate) {
          modifiedItems.push({
            ...item,
            key: `${item.id}-Claimed`,
            action: "Claimed",
            displayDate: new Date(
              item.claimedDate || item.updatedAt
            ).toLocaleDateString(),
            displayTime: new Date(
              item.claimedDate || item.updatedAt
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            sortDate: new Date(item.claimedDate),
          });
        }
      });

      // Fetch Historical (Deleted) Items and Merge without overwriting "Found"
      const fetchHistoricalItems = async () => {
        const res = await fetch(`/api/items/history`);
        const fetchedHistoricalItems = await res.json();

        if (Array.isArray(fetchedHistoricalItems)) {
          fetchedHistoricalItems.forEach((item) => {
            // Add found items from historical data, if they have a dateFound
            if (item.dateFound) {
              modifiedItems.push({
                ...item,
                key: `${item.id}-Found`,
                action: "Found",
                displayDate: new Date(
                  item.dateFound || item.createdAt
                ).toLocaleDateString(),
                displayTime: new Date(
                  item.dateFound || item.createdAt
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                sortDate: new Date(item.dateFound || item.createdAt),
              });
            }

            // Add the deleted row separately
            modifiedItems.push({
              ...item,
              key: `${item.id}-Deleted`,
              action: "Deleted",
              displayDate: new Date(
                item.updatedAt || item.createdAt
              ).toLocaleDateString(),
              displayTime: new Date(
                item.updatedAt || item.createdAt
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              sortDate: new Date(item.updatedAt || item.createdAt),
            });
          });
        }
      };

      await fetchHistoricalItems();

      // Apply filters
      if (filters.action && filters.action.length > 0) {
        modifiedItems = modifiedItems.filter((item) =>
          filters.action.includes(item.action)
        );
      }

      // Apply name filter
      if (filters.name) {
        // Split the input by commas and trim spaces
        const queries = filters.name
          .split(",")
          .map((query) => query.trim().toLowerCase());

        // Check if any of the queries match either the item name or the category
        modifiedItems = modifiedItems.filter((item) =>
          queries.some(
            (query) =>
              item.item.toLowerCase().includes(query) || // Matches item name
              item.category.toLowerCase().includes(query) || // Matches category
              item.location.toLowerCase().includes(query) || //Matches location
              item.department.toLowerCase().includes(query)
          )
        );
      }

      // Apply date filter
      if (filters.dateRange && filters.dateRange.length === 2) {
        const [startDate, endDate] = filters.dateRange;
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        modifiedItems = modifiedItems.filter((item) => {
          // Convert displayDate (string) back to a Date object for comparison
          const itemDate = new Date(item.displayDate);

          // Check if itemDate (parsed from displayDate) is within the range
          return (!start || itemDate >= start) && (!end || itemDate <= end);
        });
      }

      // Sort all items by date and update state
      setItems(modifiedItems.sort((a, b) => b.sortDate - a.sortDate));
      setItemsFoundCount(foundCounts.reverse());
      setItemsClaimedCount(claimedCounts.reverse());
      setTotalItemsReported(fetchedItems.length);
      setItemsClaimed(getCount(fetchedItems, "Claimed"));
      setItemsPending(getCount(fetchedItems, "Available"));
      setRecentFoundItems(recentFound);
      setRecentClaimedItems(recentClaimed);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  const getCount = (items, status) =>
    items.filter((item) => item.status === status).length;

  useEffect(() => {
    console.log("Current User:", currentUser); // Add this line
    if (currentUser && currentUser.id) {
      console.log("Fetching items and users...");

      if (filters) {
        fetchItems(filters); // Fetch items based on current filters
      }

      if (currentUser.role === "admin" || currentUser.role === "superAdmin") {
        fetchAllUsers();
      }
    }
  }, [currentUser, filters]);

  useEffect(() => {
    if (users.length > 0 && currentUser) {
      let filteredUsers = users;

      // Admin users should only count users in their department
      if (currentUser.role === "admin") {
        filteredUsers = users.filter(
          (user) =>
            user.department === currentUser.department && user.role === "staff"
        );
      }

      // Set the total users based on the filtered users
      setTotalUsers(filteredUsers.length);
    }
  }, [users, currentUser]);

  const fetchAllUsers = async () => {
    try {
      const res = await fetch("/api/users"); // Fetch all users from the backend
      if (res.ok) {
        const data = await res.json();
        setUsers(data); // Store all users
      } else {
        console.error("Failed to fetch users, status:", res.status);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Apply filters
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
  };

  const handleGenerateReport = () => {
    generateReport(items);
  };

  const pieChartData = {
    series: [itemsClaimed, itemsPending],
    options: {
      labels: ["Items Claimed", "Unclaimed Items"],
      colors: ["#0e9f6e", "#e72121"],
      legend: {
        position: "bottom",
      },
    },
  };

  const lineChartData = {
    series: [
      {
        name: "Items Found",
        data: itemsFoundCount,
      },
      {
        name: "Items Claimed",
        data: itemsClaimedCount,
      },
    ],
    options: {
      chart: {
        type: "line",
      },
      xaxis: {
        categories: [
          "6 days ago",
          "5 days ago",
          "4 days ago",
          "3 days ago",
          "2 days ago",
          "Yesterday",
          "Today",
        ],
      },
    },
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-300 min-h-screen w-full overflow-x-auto">
      <div className="mb-1">
        <h1 className="text-3xl font-bold mb-6 text-start ">
          Dashboard Analytics
        </h1>
        <div className="flex flex-wrap gap-4 py-3 mx-auto justify-center">
          {currentUser.role !== "staff" && (
            <div className="flex flex-col p-6 bg-green-500 gap-4 md:w-72 w-full rounded-lg shadow-lg text-white">
              <div className="flex justify-between ">
                <div>
                  <h3 className="text-white text-md uppercase">Total Users</h3>
                  <p className="text-3xl font-semibold">{totalUsers}</p>
                </div>
                <HiOutlineUserGroup className="text-white text-5xl p-2" />
              </div>
            </div>
          )}
          <div className="flex flex-col p-6 bg-yellow-500 gap-4 md:w-72 w-full rounded-lg shadow-lg text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white text-md uppercase">Total Items</h3>
                <p className="text-3xl font-semibold">{totalItemsReported}</p>
              </div>
              <HiDocumentText className="text-white text-5xl p-2" />
            </div>
          </div>
          <div className="flex flex-col p-6 bg-orange-500 gap-4 md:w-72 w-full rounded-lg shadow-lg text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white text-md uppercase">Items Claimed</h3>
                <p className="text-3xl font-semibold">{itemsClaimed}</p>
              </div>
              <HiDocumentText className="text-white text-5xl p-2" />
            </div>
            <div className="flex justify-between">
              <span className="text-green-200 flex items-center">
                <HiArrowNarrowUp />
                {itemsClaimed}
              </span>
              <div className="text-gray-200">Items Claimed</div>
            </div>
          </div>
          <div className="flex flex-col p-6 bg-red-500 gap-4 md:w-72 w-full rounded-lg shadow-lg text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white text-md uppercase">
                  Unclaimed Items
                </h3>
                <p className="text-3xl font-semibold">{itemsPending}</p>
              </div>
              <HiClipboardList className="text-white text-5xl p-2" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 py-3 mx-auto justify-center">
        <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800 ">
          <ReactApexChart
            options={pieChartData.options}
            series={pieChartData.series}
            type="pie"
            width="100%"
            height="100%"
          />
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full md:w-1/2 h-96">
          <ReactApexChart
            options={lineChartData.options}
            series={lineChartData.series}
            type="line"
            width="100%"
            height="100%"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4 py-3 mx-auto justify-center">
        <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800 overflow-x-auto">
          <div className="flex justify-between p-3 text-sm font-semibold">
            <h1 className="text-center p-2">Recent Found Items</h1>
            <Button outline gradientDuoTone="purpleToPink">
              <Link to={"/dashboard?tab=found-items"}>See all</Link>
            </Button>
          </div>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Image</Table.HeadCell>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Date</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {(recentFoundItems || []).map((item) => (
                <Table.Row
                  key={item.id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell>
                    <img
                      src={item.imageUrls?.[0] || "default-image.png"}
                      alt="item"
                      className="w-10 h-10 rounded-full bg-gray-500"
                      onError={(e) => {
                        e.target.onError = null;
                        e.target.src = "default-image.png";
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell>{item.item}</Table.Cell>
                  <Table.Cell>
                    {new Date(
                      item.createdAt || item.dateFound
                    ).toLocaleDateString()}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
        <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800 overflow-x-auto">
          <div className="flex justify-between p-3 text-sm font-semibold">
            <h1 className="text-center p-2">Recent Claimed Items</h1>
            <Button outline gradientDuoTone="purpleToPink">
              <Link to={"/dashboard?tab=crud-items"}>See all</Link>
            </Button>
          </div>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Image</Table.HeadCell>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Date</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {(recentClaimedItems || []).map((item) => (
                <Table.Row
                  key={item.id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell>
                    <img
                      src={item.imageUrls?.[0] || "default-image.png"}
                      alt="item"
                      className="w-10 h-10 rounded-full bg-gray-500"
                      onError={(e) => {
                        e.target.onError = null;
                        e.target.src = "default-image.png";
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell>{item.item}</Table.Cell>
                  <Table.Cell>
                    {new Date(item.claimedDate).toLocaleDateString()}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>
      <div className="mx-auto p-3 w-full overflow-x-auto">
        <br />
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-4">
            Audit Logs
          </h1>
          <div className="flex justify-end mb-4">
            {(currentUser.role === "admin" ||
              currentUser.role === "superAdmin") && (
              <button
                onClick={handleGenerateReport}
                className="bg-red-900 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
              >
                <HiDownload className="mr-2" />
                Download Report
              </button>
            )}
          </div>
        </div>
        <div className="flex mb-4">
          <button
            onClick={() => setShowFilterModal(true)}
            className="bg-red-900 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            Filter
          </button>
          <Button color="gray" onClick={clearFilters} className="ml-2">
            Clear Filters
          </Button>
        </div>
        <div className="w-full overflow-x-auto">
          <br></br>
          <Table
            hoverable
            className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400"
          >
            <Table.Head>
              <Table.HeadCell className="px-6">
                {filters.action && filters.action.length > 0
                  ? filters.action.join("/ ") // Join multiple actions with commas
                  : "Action"}{" "}
                {/* Default to "Action" if no filter is selected */}
              </Table.HeadCell>
              <Table.HeadCell className="px-2">
                {
                  filters.dateRange && filters.dateRange.length === 2
                    ? filters.dateRange[0] && !filters.dateRange[1] // Only start date selected
                      ? new Date(
                          new Date(filters.dateRange[0]).setDate(
                            new Date(filters.dateRange[0]).getDate() + 1
                          )
                        ).toLocaleDateString("en-GB") // Show day before for start date
                      : !filters.dateRange[0] && filters.dateRange[1] // Only end date selected
                      ? new Date(filters.dateRange[1]).toLocaleDateString(
                          "en-GB"
                        ) // Format end date
                      : filters.dateRange[0] &&
                        filters.dateRange[1] &&
                        filters.dateRange[0] === filters.dateRange[1] // Both dates selected but are the same
                      ? new Date(
                          new Date(filters.dateRange[0]).setDate(
                            new Date(filters.dateRange[0]).getDate() + 1
                          )
                        ).toLocaleDateString("en-GB") // Show day before if same
                      : filters.dateRange[0] && filters.dateRange[1] // Both start and end date selected
                      ? `${new Date(
                          new Date(filters.dateRange[0]).setDate(
                            new Date(filters.dateRange[0]).getDate() + 1
                          )
                        ).toLocaleDateString("en-GB")} - ${new Date(
                          filters.dateRange[1]
                        ).toLocaleDateString("en-GB")}` // Show adjusted start and regular end date
                      : "Date" // Default to "Date" if no valid dates are selected
                    : "Date" // Default to "Date" if no filter is selected
                }
              </Table.HeadCell>
              <Table.HeadCell className="px-2">Time</Table.HeadCell>
              <Table.HeadCell className="px-2">Item Name</Table.HeadCell>
              <Table.HeadCell>Image</Table.HeadCell>
              <Table.HeadCell className="px-2">Description</Table.HeadCell>
              <Table.HeadCell className="px-2">
                Department Surrendered
              </Table.HeadCell>
              <Table.HeadCell className="px-2">Location Found</Table.HeadCell>
              <Table.HeadCell className="px-2">Category</Table.HeadCell>
              <Table.HeadCell className="px-2">Turnover Person</Table.HeadCell>
              <Table.HeadCell className="px-2">Turnover Date</Table.HeadCell>
            </Table.Head>
            <Table.Body className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
              {[...items].map((item, index) => (
                <Table.Row
                  key={item.key || index}
                  className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Table.Cell className="px-6 py-4">{item.action}</Table.Cell>
                  <Table.Cell className="px-2 py-4">
                    {item.displayDate}
                  </Table.Cell>
                  <Table.Cell className="px-2 py-4">
                    {item.displayTime}
                  </Table.Cell>
                  <Table.Cell className="px-2 py-4">
                    <Link to={`/item/${item.id}`}>{item.item}</Link>
                  </Table.Cell>
                  <Table.Cell className="px-2 py-4">
                    {item.imageUrls && item.imageUrls[0] ? (
                      <img
                        src={item.imageUrls[0]}
                        alt={item.item}
                        className="w-12 h-12 rounded-md object-cover object-center"
                        onError={(e) => {
                          e.target.onError = null; // Prevents looping
                          e.target.src = "/default-image.png"; // Specify your default image URL here
                        }}
                      />
                    ) : (
                      <img
                        src="/default-image.png" // Specify your default image URL here
                        alt="Default"
                        className="w-12 h-12 rounded-md object-cover object-center"
                      />
                    )}
                  </Table.Cell>
                  <Table.Cell className="px-2 py-4">
                    {item.description}
                  </Table.Cell>
                  <Table.Cell className="px-2 py-4">
                    {item.department}
                  </Table.Cell>
                  <Table.Cell className="px-2 py-4">{item.location}</Table.Cell>
                  <Table.Cell className="px-2 py-4">{item.category}</Table.Cell>
                  <Table.Cell className="px-2 py-4">
                    {item.turnoverPerson}
                  </Table.Cell>
                  <Table.Cell className="px-2 py-6">
                    {item.turnoverDate}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <FilterModal
            show={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            onApplyFilters={applyFilters}
            clearFilters={clearFilters}
          />
        </div>
      </div>
    </div>
  );
}
