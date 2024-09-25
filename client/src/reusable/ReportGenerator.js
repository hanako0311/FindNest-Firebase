import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const generateReport = (items, historicalItems) => {
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

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Found Items Report");

    // Calculate and set column widths based on content length
    const columnWidths = data.reduce((colWidths, row) => {
      Object.keys(row).forEach((key, index) => {
        const colWidth = Math.min(
          Math.max(
            colWidths[index] || 10,
            row[key] ? row[key].toString().length : 0
          ),
          30 // Set a maximum column width of 30 characters
        );
        colWidths[index] = colWidth + 2; // Add some padding
      });
      return colWidths;
    }, []);

    worksheet["!cols"] = columnWidths.map((width) => ({ wch: width }));

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "found_items_report.xlsx");
  } catch (error) {
    console.error("Error generating report:", error.message);
  }
};
