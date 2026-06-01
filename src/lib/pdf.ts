import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { CartItem, Sale } from "@/types";
import { format } from "date-fns";

// For pdfmake v1, we use this fix:
if (pdfFonts && (pdfFonts as any).pdfMake) {
  (pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;
}

export const generateReceipt = (sale: Partial<Sale>, items: CartItem[]) => {
  const docDefinition: any = {
    content: [
      { text: "MEDICARE PRO EXTRA", style: "header", alignment: "center" },
      { text: "Pharmacy Management System", style: "subheader", alignment: "center" },
      { text: "University of Malakand, Dir", alignment: "center", margin: [0, 0, 0, 10] },
      
      { canvas: [{ type: "line", x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 }] },
      
      {
        margin: [0, 10, 0, 10],
        columns: [
          { text: `Invoice: #${sale.invoice_no?.slice(-8)}`, bold: true },
          { text: `Date: ${format(new Date(), "PPpp")}`, alignment: "right" }
        ]
      },
      
      { text: `Customer: ${sale.customer_name || "Walk-in Customer"}`, margin: [0, 0, 0, 15] },
      
      {
        table: {
          headerRows: 1,
          widths: ["*", "auto", "auto", "auto"],
          body: [
            [
              { text: "Item Description", fillAlpha: 0.1, fillBg: "#F0F4FF", bold: true },
              { text: "Qty", alignment: "center", fillAlpha: 0.1, fillBg: "#F0F4FF", bold: true },
              { text: "Price", alignment: "right", fillAlpha: 0.1, fillBg: "#F0F4FF", bold: true },
              { text: "Total", alignment: "right", fillAlpha: 0.1, fillBg: "#F0F4FF", bold: true }
            ],
            ...items.map(item => [
              item.name,
              { text: item.qty.toString(), alignment: "center" },
              { text: item.sell_price.toFixed(2), alignment: "right" },
              { text: (item.qty * item.sell_price).toFixed(2), alignment: "right" }
            ])
          ]
        },
        layout: "lightHorizontalLines"
      },
      
      {
        margin: [0, 20, 0, 0],
        columns: [
          { text: "" },
          {
            width: 150,
            stack: [
              { columns: ["Subtotal:", { text: `Rs. ${sale.total?.toFixed(2)}`, alignment: "right" }] },
              { columns: ["Discount:", { text: `- Rs. ${sale.discount?.toFixed(2)}`, alignment: "right" }] },
              { columns: ["Tax:", { text: `Rs. ${sale.tax?.toFixed(2)}`, alignment: "right" }], margin: [0, 0, 0, 5] },
              { canvas: [{ type: "line", x1: 0, y1: 2, x2: 150, y2: 2, lineWidth: 1 }] },
              { 
                columns: [
                  { text: "NET TOTAL:", bold: true, fontSize: 14 }, 
                  { text: `Rs. ${sale.net_total?.toFixed(2)}`, alignment: "right", bold: true, fontSize: 14 }
                ],
                margin: [0, 5, 0, 0]
              }
            ]
          }
        ]
      },
      
      { text: "Payment Details", style: "subheader", margin: [0, 20, 0, 5] },
      {
        columns: [
          { text: `Payment Method: ${sale.payment_method}` },
          { text: `Amount Paid: Rs. ${sale.amount_paid?.toFixed(2)}`, alignment: "right" }
        ]
      },
      { text: `Change Due: Rs. ${sale.change_due?.toFixed(2)}`, alignment: "right", color: "#1B6CA8", bold: true },
      
      { text: "Thank you for visiting MediCare Pro!", alignment: "center", margin: [0, 40, 0, 0], italic: true }
    ],
    styles: {
      header: { fontSize: 22, bold: true, color: "#1B4FA8" },
      subheader: { fontSize: 12, bold: true, color: "#444" }
    },
    defaultStyle: { fontSize: 10 }
  };

  pdfMake.createPdf(docDefinition).download(`Receipt_${sale.invoice_no}.pdf`);
};

export const generateInventoryReport = (medicines: any[]) => {
  const docDefinition: any = {
    content: [
      { text: "MEDICARE PRO EXTRA", style: "header", alignment: "center" },
      { text: "Inventory Status Report", style: "subheader", alignment: "center", margin: [0, 0, 0, 20] },
      
      {
        table: {
          headerRows: 1,
          widths: ["*", "auto", "auto", "auto", "auto", "auto"],
          body: [
            [
              { text: "Item Name", bold: true, fillBg: "#F8FAFC" },
              { text: "Category", bold: true, fillBg: "#F8FAFC" },
              { text: "Stock", bold: true, alignment: "center", fillBg: "#F8FAFC" },
              { text: "Min", bold: true, alignment: "center", fillBg: "#F8FAFC" },
              { text: "Price (Rs.)", bold: true, alignment: "right", fillBg: "#F8FAFC" },
              { text: "Status", bold: true, alignment: "center", fillBg: "#F8FAFC" }
            ],
            ...medicines.map(m => [
              m.name,
              m.category,
              { text: m.stock.toString(), alignment: "center" },
              { text: m.min_stock.toString(), alignment: "center" },
              { text: m.sell_price.toFixed(2), alignment: "right" },
              { text: m.status, alignment: "center", color: m.status === 'OK' ? '#059669' : '#DC2626' }
            ])
          ]
        },
        layout: "lightHorizontalLines"
      },
      
      { 
        text: `Report Generated on: ${format(new Date(), "PPpp")}`, 
        margin: [0, 20, 0, 0], 
        alignment: "center", 
        fontSize: 8, 
        color: "#94A3B8" 
      }
    ],
    styles: {
      header: { fontSize: 20, bold: true, color: "#0F172A" },
      subheader: { fontSize: 14, bold: true, color: "#64748B" }
    },
    defaultStyle: { fontSize: 9, color: "#334155" }
  };

  pdfMake.createPdf(docDefinition).download(`Inventory_Report_${format(new Date(), "yyyyMMdd")}.pdf`);
};

export const generateSalesReport = (sales: any[]) => {
  const docDefinition: any = {
    content: [
      { text: "MEDICARE PRO EXTRA", style: "header", alignment: "center" },
      { text: "Sales Summary Report", style: "subheader", alignment: "center", margin: [0, 0, 0, 20] },
      
      {
        table: {
          headerRows: 1,
          widths: ["auto", "*", "auto", "auto", "auto"],
          body: [
            [
              { text: "Invoice #", bold: true, fillBg: "#F8FAFC" },
              { text: "Customer", bold: true, fillBg: "#F8FAFC" },
              { text: "Method", bold: true, alignment: "center", fillBg: "#F8FAFC" },
              { text: "Date", bold: true, alignment: "center", fillBg: "#F8FAFC" },
              { text: "Net Total (Rs.)", bold: true, alignment: "right", fillBg: "#F8FAFC" }
            ],
            ...sales.map(s => [
              s.invoice_no.slice(-8),
              s.customer_name || "Walk-in",
              { text: s.payment_method, alignment: "center" },
              { text: format(new Date(s.created_at), "MMM dd, yyyy"), alignment: "center" },
              { text: s.net_total.toFixed(2), alignment: "right", bold: true }
            ])
          ]
        },
        layout: "lightHorizontalLines"
      },
      
      { 
        margin: [0, 20, 0, 0],
        columns: [
          { text: "" },
          { 
            text: `TOTAL REVENUE: Rs. ${sales.reduce((sum, s) => sum + s.net_total, 0).toFixed(2)}`, 
            alignment: "right", 
            bold: true, 
            fontSize: 12,
            color: "#0F172A"
          }
        ]
      }
    ],
    styles: {
      header: { fontSize: 20, bold: true, color: "#0F172A" },
      subheader: { fontSize: 14, bold: true, color: "#64748B" }
    },
    defaultStyle: { fontSize: 9, color: "#334155" }
  };

  pdfMake.createPdf(docDefinition).download(`Sales_Report_${format(new Date(), "yyyyMMdd")}.pdf`);
};
