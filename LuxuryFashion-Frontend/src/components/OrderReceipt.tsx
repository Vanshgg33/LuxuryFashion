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
    isFree?: boolean;
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

// KOT (Kitchen Order Ticket) Style Receipt - Only items, no prices
export const OrderReceipt = forwardRef<HTMLDivElement, OrderReceiptProps>(
  ({ order }, ref) => {
    return (
      <div
        ref={ref}
        className="print-receipt"
        style={{
          width: "80mm",
          padding: "8mm",
          fontFamily: "monospace",
          fontSize: "12px",
          backgroundColor: "white",
          color: "black",
        }}
      >
        {/* Header - KOT Style */}
        <div style={{ textAlign: "center", marginBottom: "8px", borderBottom: "2px dashed #000", paddingBottom: "8px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "bold", margin: "0 0 4px 0", letterSpacing: "2px" }}>
            KOT
          </h1>
          <p style={{ fontSize: "10px", margin: "0", color: "#333" }}>KITCHEN ORDER TICKET</p>
        </div>

        {/* Order Info */}
        <div style={{ marginBottom: "10px", paddingBottom: "8px", borderBottom: "1px dashed #000" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "14px", fontWeight: "bold" }}>#{order.orderId.slice(-6).toUpperCase()}</span>
            <span style={{
              fontSize: "12px",
              fontWeight: "bold",
              padding: "2px 8px",
              backgroundColor: order.orderType === "delivery" ? "#000" : "#666",
              color: "#fff",
              borderRadius: "2px"
            }}>
              {order.orderType === "delivery" ? "DELIVERY" : "TAKEAWAY"}
            </span>
          </div>
          <div style={{ fontSize: "11px", color: "#333" }}>
            {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} | {new Date().toLocaleDateString("en-IN")}
          </div>
        </div>

        {/* Order Items - Large and Clear */}
        <div style={{ marginBottom: "10px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #000" }}>
                <th style={{ textAlign: "center", padding: "6px 0", fontSize: "14px", fontWeight: "bold", width: "50px" }}>QTY</th>
                <th style={{ textAlign: "left", padding: "6px 8px", fontSize: "14px", fontWeight: "bold" }}>ITEM</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px dashed #ccc" }}>
                  <td style={{
                    textAlign: "center",
                    padding: "10px 0",
                    fontSize: "18px",
                    fontWeight: "bold",
                    verticalAlign: "top"
                  }}>
                    {item.quantity}x
                  </td>
                  <td style={{
                    padding: "10px 8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    wordWrap: "break-word",
                    lineHeight: "1.3"
                  }}>
                    {item.name}
                    {item.isFree && (
                      <span style={{
                        marginLeft: "6px",
                        fontSize: "10px",
                        backgroundColor: "#000",
                        color: "#fff",
                        padding: "1px 4px",
                        borderRadius: "2px"
                      }}>FREE</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Items Count */}
        <div style={{
          textAlign: "center",
          padding: "8px",
          backgroundColor: "#f0f0f0",
          borderRadius: "4px",
          marginBottom: "8px"
        }}>
          <span style={{ fontSize: "12px", fontWeight: "bold" }}>
            TOTAL ITEMS: {order.items.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", paddingTop: "8px", borderTop: "2px dashed #000" }}>
          <p style={{ margin: "0", fontSize: "10px", color: "#666" }}>
            - - - - - - - - - - - - - - -
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
