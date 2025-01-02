import React from "react";
import { CartItem } from "../store/slices/cartSlice";

export interface AcquirerData {
    bank_transaction_id: string;
}

export interface Notes {
    address?: string;
}

export interface BillData {
    _id: {
        $oid: string;
    };
    id: string;
    entity: string;
    amount: number; // Amount in paise (divide by 100 for INR)
    currency: string;
    status: string;
    order_id: string;
    invoice_id: string | null;
    international: boolean;
    method: string;
    amount_refunded: number;
    refund_status: string | null;
    captured: boolean;
    description: string;
    card_id: string | null;
    bank: string | null;
    wallet: string | null;
    vpa: string | null;
    email: string;
    contact: string;
    notes: Notes;
    fee: number; // Fee in paise
    tax: number; // Tax in paise
    error_code: string | null;
    error_description: string | null;
    error_source: string | null;
    error_step: string | null;
    error_reason: string | null;
    acquirer_data: AcquirerData;
    created_at: number; // Unix timestamp
    kitchenId: string;
    __v: number;
}
interface BillComponentProps {
    billData: BillData;
    items: CartItem[];
    userName: String;
}

const BillComponent: React.FC<BillComponentProps> = ({ billData, items, userName }) => {
    return (
      <div
        id="bill-container"
        style={{
          padding: "20px",
          backgroundColor: "#fff",
          width: "100%",
          maxWidth: "600px",
          margin: "20px auto",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          fontFamily: "'Noto Sans', sans-serif",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>(Receipt)</h1>
  
        <section>
          <h2 style={{ fontSize: "1.2rem", color: "#333" }}>Order Information</h2>
          <h4 style={{ color: "#333" }}>Order ID: {billData.order_id}</h4>
          <h4 style={{ color: "#333" }}>Transaction ID: {billData.acquirer_data?.bank_transaction_id}</h4>
          <h4 style={{ color: "#333" }}>Payment ID: {billData.id}</h4>
          <h4 style={{ color: "#333" }}>Status: {billData.status}</h4>
          <h4 style={{ color: "#333" }}>Description: {billData.description}</h4>
          <h4 style={{ color: "#333" }}>Payment Method: {billData.method}</h4>
          <h4 style={{ color: "#333" }}>Bank: {billData.bank}</h4>
        </section>
  
        <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #eee" }} />
  
        <section>
          <h2 style={{ fontSize: "1.2rem", color: "#333" }}>Items</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ccc" }}>
                <th style={{ color: "#333", textAlign: "left", padding: "5px" }}>Name</th>
                <th style={{ color: "#333", textAlign: "center", padding: "5px" }}>Price</th>
                <th style={{ color: "#333", textAlign: "center", padding: "5px" }}>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.itemId} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ color: "#333", padding: "5px" }}>{item.name}</td>
                  <td style={{ color: "#333", textAlign: "center", padding: "5px" }}>₹{item.price}</td>
                  <td style={{ color: "#333", textAlign: "center", padding: "5px" }}>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
  
        <section>
          <h2 style={{ fontSize: "1.2rem", color: "#333" }}>Payment Details</h2>
          <h4 style={{ color: "#333" }}>Amount: ₹{(billData.amount / 100).toFixed(2)}</h4>
          {billData.amount_refunded !== 0 && (
            <h4 style={{ color: "#333" }}>Total Refund: ₹{(billData.amount_refunded / 100).toFixed(2)}</h4>
          )}
        </section>
  
        <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #eee" }} />
  
        <section>
          <h2 style={{ fontSize: "1.2rem", color: "#333" }}>Customer Information</h2>
          <h4 style={{ color: "#333" }}>Name: {userName}</h4>
          <h4 style={{ color: "#333" }}>Email: {billData.email}</h4>
          <h4 style={{ color: "#333" }}>Contact: {billData.contact}</h4>
          <h4 style={{ color: "#333" }}>Address: {billData.notes?.address || "N/A"}</h4>
        </section>
  
        <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #eee" }} />
  
        <section>
          <h2 style={{ fontSize: "1.2rem", color: "#333" }}>Additional Information</h2>
          <h4 style={{ color: "#333" }}>Kitchen ID: {billData.kitchenId}</h4>
          <h4 style={{ color: "#333" }}>Created At: {new Date(billData.created_at * 1000).toLocaleString()}</h4>
          <h4 style={{ color: "#333" }}>International: {billData.international ? "Yes" : "No"}</h4>
        </section>
      </div>
    );
  };
  
  export default BillComponent;

