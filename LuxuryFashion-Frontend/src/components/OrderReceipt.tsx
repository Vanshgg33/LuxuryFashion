import { forwardRef } from "react";

export interface OrderReceiptData {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  orderType: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    label?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  discountAmount?: number;
  couponCode?: string;
  totalAmount: number;
}

interface OrderReceiptProps {
  order: OrderReceiptData;
  restaurantName?: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
}

export const OrderReceipt = forwardRef<HTMLDivElement, OrderReceiptProps>(
  ({ order }, ref) => {
    return (
      <div
        ref={ref}
        className="print-receipt"
        style={{
          width: "80mm",
          padding: "10mm",
          fontFamily: "monospace",
          fontSize: "12px",
          backgroundColor: "white",
          color: "black",
        }}
      >
        {/* Order ID */}
        <div style={{ textAlign: "center", marginBottom: "15px", borderBottom: "2px solid #000", paddingBottom: "10px" }}>
          <h1 style={{ fontSize: "16px", fontWeight: "bold", margin: "0" }}>
            ORDER #{order.orderId.slice(-8).toUpperCase()}
          </h1>
        </div>

        {/* Order Items */}
        <div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #000" }}>
                <th style={{ textAlign: "left", padding: "8px 0", fontSize: "12px" }}>Item</th>
                <th style={{ textAlign: "center", padding: "8px 0", fontSize: "12px" }}>Qty</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px dotted #ccc" }}>
                  <td style={{ padding: "8px 0", fontSize: "12px", maxWidth: "150px", wordWrap: "break-word" }}>
                    {item.name}
                  </td>
                  <td style={{ textAlign: "center", padding: "8px 0", fontSize: "14px", fontWeight: "bold" }}>
                    {item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Simple Footer Line */}
        <div style={{ textAlign: "center", marginTop: "15px", paddingTop: "10px", borderTop: "2px solid #000" }}>
          <p style={{ margin: "0", fontSize: "10px", color: "#666" }}>
            {new Date().toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    );
  }
);

OrderReceipt.displayName = "OrderReceipt";

// Utility function to print the receipt
export const printReceipt = (receiptElement: HTMLElement | null) => {
  if (!receiptElement) return;

  const printWindow = window.open("", "_blank", "width=350,height=600");
  if (!printWindow) {
    alert("Please allow popups to print the receipt");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Order Receipt</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: monospace;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @media print {
            body {
              width: 80mm;
            }
          }
        </style>
      </head>
      <body>
        ${receiptElement.outerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};
