import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generates an official, beautifully styled PDF invoice for a booking.
 * @param {Object} booking - Booking details
 * @param {Object} clientInfo - Customer info (name, email, phone)
 * @returns {jsPDF} The jsPDF document instance
 */
export function createInvoiceDoc(booking, clientInfo = {}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const b = booking || {};
  const photographerName =
    typeof b.photographer === "string" && b.photographer !== "Professional Photographer"
      ? b.photographer
      : b.photographer?.name || (b.photographerName && b.photographerName !== "Professional Photographer" ? b.photographerName : "Alex Morgan");
  const displayDate = b.eventDate || b.date || "Scheduled Date";
  const displayTime = b.slotLabel || b.time || (b.startTime ? `${b.startTime} - ${b.endTime}` : "Scheduled Time");
  const totalAmount = Number(b.totalAmount || b.amount || 0);
  const depositPaid = totalAmount * 0.3;
  const balanceDue = totalAmount * 0.7;

  // Header Background banner
  doc.setFillColor(11, 19, 41); // Deep Navy (#0b1329)
  doc.rect(0, 0, 210, 45, "F");

  // Accent line
  doc.setFillColor(229, 185, 90); // Gold (#e5b95a)
  doc.rect(0, 45, 210, 2.5, "F");

  // Header Title & Logo text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("SHUTTER MOMENTS", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(200, 210, 230);
  doc.text("Premium Photography & Event Studio", 14, 27);
  doc.text("Web: www.shuttermoments.com | Tel: +94 77 123 4567", 14, 33);

  // Invoice Title block on right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(229, 185, 90);
  doc.text("INVOICE / RECEIPT", 196, 20, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`Invoice No: INV-${b.id || "0000"}`, 196, 27, { align: "right" });
  doc.text(`Issue Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`, 196, 33, { align: "right" });

  // Bill To & Session Details Boxes
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, 55, 88, 38, 3, 3, "F");
  doc.roundedRect(108, 55, 88, 38, 3, 3, "F");

  // Client Details Box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(11, 19, 41);
  doc.text("BILLED TO (CLIENT)", 20, 63);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 70, 85);
  doc.text(`Name: ${clientInfo.name || b.client || "Customer"}`, 20, 70);
  doc.text(`Email: ${clientInfo.email || b.clientEmail || "customer@example.com"}`, 20, 76);
  doc.text(`Phone: ${clientInfo.phone || b.clientPhone || "+94 7X XXX XXXX"}`, 20, 82);
  doc.text(`Location: ${b.location || "On-site session"}`, 20, 88);

  // Session & Photographer Details Box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(11, 19, 41);
  doc.text("SESSION INFORMATION", 114, 63);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 70, 85);
  doc.text(`Booking ID: ${b.id}`, 114, 70);
  doc.text(`Photographer: ${photographerName}`, 114, 76);
  doc.text(`Date: ${displayDate}`, 114, 82);
  doc.text(`Time Slot: ${displayTime}`, 114, 88);

  // Table items
  const services = b.selectedServices || [];
  const servicesSum = services.reduce((acc, s) => acc + Number(s.price || 0), 0);
  const basePhotoFee = totalAmount - servicesSum;

  const tableRows = [
    [
      `Photography Session (${b.photographyType || b.event || "Standard Package"})`,
      "1 Session",
      `Rs. ${basePhotoFee.toLocaleString()}`,
      `Rs. ${basePhotoFee.toLocaleString()}`,
    ],
  ];

  services.forEach((s) => {
    tableRows.push([
      `Add-on: ${s.name}`,
      "1 Item",
      `Rs. ${Number(s.price || 0).toLocaleString()}`,
      `Rs. ${Number(s.price || 0).toLocaleString()}`,
    ]);
  });

  autoTable(doc, {
    startY: 100,
    head: [["Description", "Qty / Duration", "Unit Price", "Amount"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [11, 19, 41],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9.5,
    },
    bodyStyles: {
      textColor: [40, 50, 65],
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 30, halign: "center" },
      2: { cellWidth: 30, halign: "right" },
      3: { cellWidth: 26, halign: "right" },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 8;

  // Financial summary block
  const summaryX = 114;
  const summaryWidth = 82;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(summaryX, finalY, summaryWidth, 46, 2, 2, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(70, 80, 95);
  doc.text("Total Booking Amount:", summaryX + 6, finalY + 10);
  doc.text(`Rs. ${totalAmount.toLocaleString()}`, summaryX + summaryWidth - 6, finalY + 10, { align: "right" });

  // 30% Advance Paid
  doc.setFont("helvetica", "bold");
  doc.setTextColor(34, 197, 94); // Green
  doc.text("30% Advance Deposit (Paid):", summaryX + 6, finalY + 19);
  doc.text(`Rs. ${depositPaid.toLocaleString()}`, summaryX + summaryWidth - 6, finalY + 19, { align: "right" });

  // Divider line
  doc.setDrawColor(220, 225, 235);
  doc.line(summaryX + 6, finalY + 25, summaryX + summaryWidth - 6, finalY + 25);

  // 70% Balance Due
  doc.setFont("helvetica", "bold");
  doc.setTextColor(217, 119, 6); // Amber
  doc.text("Remaining Balance (Due):", summaryX + 6, finalY + 34);
  doc.text(`Rs. ${balanceDue.toLocaleString()}`, summaryX + summaryWidth - 6, finalY + 34, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(110, 120, 135);
  doc.text("Due on event day upon photographer arrival", summaryX + 6, finalY + 41);

  // Payment Status Stamp / Badge on left
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(34, 197, 94);
  doc.roundedRect(14, finalY, 88, 46, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(22, 101, 52);
  doc.text("STATUS: ADVANCE DEPOSIT CONFIRMED", 20, finalY + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(50, 60, 75);
  doc.text("Payment Method: Online Card / Deposit Transfer", 20, finalY + 20);
  doc.text("Payment Ref: 30% Advance Confirmed", 20, finalY + 26);
  doc.text("Invoice Status: Official Tax Receipt", 20, finalY + 32);
  doc.text("Thank you for choosing Shutter Moments!", 20, finalY + 40);

  // Terms and Footer
  const footerY = 255;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, 196, footerY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(11, 19, 41);
  doc.text("Terms & Conditions:", 14, footerY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 110, 125);
  doc.text(
    "1. The 30% deposit secures your reserved date and photographer. Remaining 70% is payable on the event day.\n" +
    "2. If cancellation occurs due to critical emergency on management side, a 100% full refund or free rescheduling applies.\n" +
    "3. Edited digital high-resolution photos will be delivered within 7-10 business days after the shoot.",
    14,
    footerY + 12
  );

  doc.setFontSize(7.5);
  doc.setTextColor(140, 150, 165);
  doc.text("Shutter Moments Studio (Pvt) Ltd. • Support: support@shuttermoments.com • +94 77 123 4567", 105, 285, { align: "center" });

  return doc;
}

/**
 * Downloads the invoice PDF with support for the native Windows/Browser "Save As" file picker
 * so the user can choose their preferred directory on their computer.
 * @param {Object} booking - Booking data
 * @param {Object} clientInfo - Customer info
 * @returns {Promise<boolean>} True if saved successfully
 */
export async function downloadInvoicePDF(booking, clientInfo = {}) {
  try {
    const doc = createInvoiceDoc(booking, clientInfo);
    const fileName = `Invoice_${booking?.id || "BK" + Date.now()}.pdf`;

    // Try modern File System Access API (Supported in Chrome, Edge, Opera)
    // This directly opens the OS "Save As" file explorer dialog for user to choose their preferred folder!
    if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: "PDF Document (*.pdf)",
              accept: { "application/pdf": [".pdf"] },
            },
          ],
        });

        const pdfBlob = doc.output("blob");
        const writable = await handle.createWritable();
        await writable.write(pdfBlob);
        await writable.close();
        return true;
      } catch (pickerError) {
        // If user cancelled the dialog, just return
        if (pickerError.name === "AbortError") {
          return false;
        }
        // Otherwise fall through to doc.save
        console.warn("File System Access API failed, falling back to standard download", pickerError);
      }
    }

    // Fallback: standard anchor download
    doc.save(fileName);
    return true;
  } catch (err) {
    console.error("Error generating invoice PDF:", err);
    throw err;
  }
}
