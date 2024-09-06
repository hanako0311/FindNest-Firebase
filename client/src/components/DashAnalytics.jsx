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
import Papa from "papaparse";
import fileDownload from "js-file-download";

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

  const fetchHistoricalItems = async () => {
    try {
      const res = await fetch(`/api/items/history`);
      const fetchedHistoricalItems = await res.json();

      let modifiedItems = [];

      if (Array.isArray(fetchedHistoricalItems)) {
        modifiedItems = fetchedHistoricalItems.map((item) => ({
          ...item,
          action: "Delete",
          displayDate: new Date(item.createdAt).toLocaleDateString(),
          displayTime: new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sortDate: new Date(item.createdAt),
        }));
      } else if (fetchedHistoricalItems) {
        modifiedItems = [
          {
            ...fetchedHistoricalItems,
            action: "Deleted",
            displayDate: new Date(
              fetchedHistoricalItems.createdAt
            ).toLocaleDateString(),
            displayTime: new Date(
              fetchedHistoricalItems.createdAt
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            sortDate: new Date(fetchedHistoricalItems.createdAt),
          },
        ];
      } else {
        console.error("Expected array:", fetchedHistoricalItems);
      }

      console.log("Fetched Historical Items:", fetchedHistoricalItems);
      setHistoricalItems(modifiedItems);
    } catch (error) {
      console.error("Failed to fetch historical items:", error);
    }
  };


  useEffect(() => {
    console.log("Recent Found Items:", recentFoundItems);
    console.log("Recent Claimed Items:", recentClaimedItems);
  }, [recentFoundItems, recentClaimedItems]);

  const fetchItems = async () => {
    try {
      const res = await fetch(`/api/items`);
      const fetchedItems = await res.json();
          console.log("Fetched Items:", fetchedItems);


      const modifiedItems = [];
      const now = new Date();
      const foundCounts = Array(7).fill(0);
      const claimedCounts = Array(7).fill(0);

      const recentFound = [];
      const recentClaimed = [];

      fetchedItems.forEach((item) => {
        const createdAt = new Date(item.createdAt);
        const daysAgoFound = Math.floor(
          (now - createdAt) / (1000 * 60 * 60 * 24)
        );
        if (daysAgoFound < 7) {
          foundCounts[daysAgoFound]++;
          if (recentFound.length < 5) {
            recentFound.push(item);
          }
        }

        if (item.status === "Claimed" && item.claimedDate) {
          const claimedDate = new Date(item.claimedDate);
          const daysAgoClaimed = Math.floor(
            (now - claimedDate) / (1000 * 60 * 60 * 24)
          );
          if (daysAgoClaimed < 7) {
            claimedCounts[daysAgoClaimed]++;
            if (recentClaimed.length < 5) {
              recentClaimed.push(item);
            }
          }
        }

        modifiedItems.push({
          ...item,
          key: `${item.id}-Found`,
          action: "Found",
          displayDate: new Date(
            item.createdAt || item.updatedAt
          ).toLocaleDateString(),
          displayTime: new Date(
            item.createdAt || item.updatedAt
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sortDate: new Date(item.createdAt),
        });

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

      setItems(modifiedItems.sort((a, b) => b.sortDate - a.sortDate));
      setItemsFoundCount(foundCounts.reverse());
      setItemsClaimedCount(claimedCounts.reverse());
      setTotalItemsReported(fetchedItems.length);
      setItemsClaimed(getCount(fetchedItems, "Claimed"));
      setItemsPending(getCount(fetchedItems, "Available"));
      setRecentFoundItems(recentFound);
      setRecentClaimedItems(recentClaimed);
      await fetchHistoricalItems();
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
      fetchItems();
      if (currentUser.role === "admin" || currentUser.role === "superAdmin") {
        fetchUsersCount();
        // fetchItemCount();
      }
    }
  }, [currentUser]);

  const fetchUsersCount = async () => {
    try {
      const res = await fetch("/api/users/count");

      if (res.ok) {
        const data = await res.text();
        const totalUsers = parseInt(data, 10);

        console.log("Fetched Users Data:", totalUsers);

        setTotalUsers(totalUsers);
        console.log("Total Users:", totalUsers);
      } else {
        console.error("Failed to fetch users, status:", res.status);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  // const fetchItemCount = async () => {
  //   try {
  //     const res = await fetch("api/items/count");

  //     if (res.ok) {
  //       const data = await res.json();
  //       const { totalCount, availableCount, claimedCount } = data;

  //       console.log("Fetched Items Data:", data);
  //       console.log("Total Items:", totalCount);
  //       console.log("Available Items:", availableCount);
  //       console.log("Claimed Items:", claimedCount);

  //       setTotalItemsReported(totalCount);
  //       setItemsPending(availableCount);
  //       setItemsClaimed(claimedCount);
  //     } else {
  //       console.error("Failed to fetch items count, status:", res.status);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch items count:", error);
  //   }
  // };

  const generateReport = () => {
    try {

      const combinedItems = [...items, ...historicalItems];

      const data = combinedItems.map((item) => ({
        Item: item.item,
        DateFound: item.displayDate,
        Location: item.location,
        Description: item.description,
        Category: item.category,
        Status: item.action,
        ClaimantName: item.claimantName || "N/A",
        ClaimedDate: item.claimedDate
          ? new Date(item.claimedDate).toISOString().split("T")[0]
          : "N/A",
      }));

      const csv = Papa.unparse(data);

      fileDownload(csv, "found_items_report.csv");
    } catch (error) {
      console.error("Error generating report:", error.message);
    }
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
                    {new Date(item.createdAt).toLocaleDateString()}
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
              {recentClaimedItems.map((item) => (
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
            {(currentUser.role === "admin" || currentUser.role === "superAdmin") && (
              <button
                onClick={generateReport}
                className="bg-red-900 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
              >
                <HiDownload className="mr-2" />
                Download Report
              </button>
            )}
          </div>
        </div>
        <br></br>
        <Table
          hoverable
          className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400"
        >
          <Table.Head className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <Table.HeadCell>Action</Table.HeadCell>
            <Table.HeadCell>Date</Table.HeadCell>
            <Table.HeadCell>Time</Table.HeadCell>
            <Table.HeadCell>Item Name</Table.HeadCell>
            <Table.HeadCell>Image</Table.HeadCell>
            <Table.HeadCell>Description</Table.HeadCell>
            <Table.HeadCell>Location</Table.HeadCell>
            <Table.HeadCell>Category</Table.HeadCell>
          </Table.Head>
          <Table.Body className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
            {[...items, ...historicalItems].map((item, index) => (
              <Table.Row
                key={item.key || index}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Table.Cell className="px-6 py-4">{item.action}</Table.Cell>
                <Table.Cell className="px-6 py-4">
                  {item.displayDate}
                </Table.Cell>
                <Table.Cell className="px-6 py-4">
                  {item.displayTime}
                </Table.Cell>
                <Table.Cell className="px-6 py-4">
                  <Link to={`/item/${item.id}`}>{item.item}</Link>
                </Table.Cell>
                <Table.Cell className="px-6 py-4">
                  {item.imageUrls && item.imageUrls[0] && (
                    <img
                      src={item.imageUrls?.[0] || "default-image.png"}
                      alt={item.item}
                      className="w-24 h-auto"
                      onError={(e) => {
                        e.target.onError = null;
                        e.target.src = "default-image.png";
                      }}
                    />
                  )}
                </Table.Cell>
                <Table.Cell className="px-6 py-4">
                  {item.description}
                </Table.Cell>
                <Table.Cell className="px-6 py-4">{item.location}</Table.Cell>
                <Table.Cell className="px-6 py-4">{item.category}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
