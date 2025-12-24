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
  ({ order, restaurantName = "Rangeela Dhaba", restaurantAddress, restaurantPhone }, ref) => {
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
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "10px", borderBottom: "1px dashed #000", paddingBottom: "10px" }}>
          <h1 style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 5px 0" }}>{restaurantName}</h1>
          {restaurantAddress && <p style={{ margin: "2px 0", fontSize: "10px" }}>{restaurantAddress}</p>}
          {restaurantPhone && <p style={{ margin: "2px 0", fontSize: "10px" }}>Tel: {restaurantPhone}</p>}
        </div>

        {/* Order Info */}
        <div style={{ marginBottom: "10px", borderBottom: "1px dashed #000", paddingBottom: "10px" }}>
          <p style={{ margin: "3px 0" }}>
            <strong>Order #:</strong> {order.orderId.slice(-8).toUpperCase()}
          </p>
          <p style={{ margin: "3px 0" }}>
            <strong>Date:</strong> {order.orderDate}
          </p>
          <p style={{ margin: "3px 0" }}>
            <strong>Type:</strong> {order.orderType === "delivery" ? "DELIVERY" : "TAKEAWAY"}
          </p>
        </div>

        {/* Customer Info */}
        <div style={{ marginBottom: "10px", borderBottom: "1px dashed #000", paddingBottom: "10px" }}>
          <p style={{ margin: "3px 0", fontWeight: "bold" }}>Customer:</p>
          <p style={{ margin: "3px 0" }}>{order.customerName}</p>
          {order.customerPhone && <p style={{ margin: "3px 0" }}>Phone: {order.customerPhone}</p>}
          {order.orderType === "delivery" && order.address && (
            <div style={{ marginTop: "5px" }}>
              <p style={{ margin: "3px 0", fontWeight: "bold" }}>Delivery Address:</p>
              <p style={{ margin: "3px 0", fontSize: "11px" }}>
                {order.address.street && <>{order.address.street}<br /></>}
                {order.address.city && <>{order.address.city}, </>}
                {order.address.state && <>{order.address.state} </>}
                {order.address.zipCode && <>{order.address.zipCode}</>}
              </p>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div style={{ marginBottom: "10px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #000" }}>
                <th style={{ textAlign: "left", padding: "5px 0", fontSize: "11px" }}>Item</th>
                <th style={{ textAlign: "center", padding: "5px 0", fontSize: "11px" }}>Qty</th>
                <th style={{ textAlign: "right", padding: "5px 0", fontSize: "11px" }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px dotted #ccc" }}>
                  <td style={{ padding: "5px 0", fontSize: "11px", maxWidth: "120px", wordWrap: "break-word" }}>
                    {item.name}
                  </td>
                  <td style={{ textAlign: "center", padding: "5px 0", fontSize: "11px" }}>
                    {item.quantity}
                  </td>
                  <td style={{ textAlign: "right", padding: "5px 0", fontSize: "11px" }}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ borderTop: "1px dashed #000", paddingTop: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", margin: "3px 0" }}>
            <span>Subtotal:</span>
            <span>₹{order.subtotal.toFixed(2)}</span>
          </div>
          {order.discountAmount && order.discountAmount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", margin: "3px 0", color: "green" }}>
              <span>Discount {order.couponCode && `(${order.couponCode})`}:</span>
              <span>-₹{order.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              margin: "8px 0 0 0",
              paddingTop: "8px",
              borderTop: "1px solid #000",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            <span>TOTAL:</span>
            <span>₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "15px", paddingTop: "10px", borderTop: "1px dashed #000" }}>
          <p style={{ margin: "5px 0", fontSize: "11px" }}>Thank you for your order!</p>
          <p style={{ margin: "3px 0", fontSize: "10px", color: "#666" }}>
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
