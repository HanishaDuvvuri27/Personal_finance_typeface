import { useState } from "react";
import axios from "axios";

interface UploadedFile {
  file: File;
  preview: string;
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  receiptUrl: string;
  ocrSuccess?: boolean;
  extractedDate?: string;
  extractedAmount?: number;
  needsAmountInput?: boolean;
}

export default function Receipts() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedTransactions, setUploadedTransactions] = useState<Transaction[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [amountInputs, setAmountInputs] = useState<{ [key: string]: string }>({});
  const [isUpdatingAmount, setIsUpdatingAmount] = useState<{ [key: string]: boolean }>({});
  const token = localStorage.getItem("token");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const uploaded = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFiles(uploaded);
  };

  const uploadFiles = async () => {
    if (files.length === 0) return alert("No files selected");

    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach(({ file }) => {
        formData.append("receipt", file);
      });

      const res = await axios.post("http://localhost:5000/api/receipts/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage(res.data.message);
      console.log("Upload response:", res.data);
      
      // Add to uploaded transactions list
      if (res.data.transaction) {
        setUploadedTransactions(prev => [...prev, res.data.transaction]);
        
        // Initialize amount input for transactions that need it
        if (res.data.transaction.needsAmountInput) {
          setAmountInputs(prev => ({
            ...prev,
            [res.data.transaction.id]: ""
          }));
        }
      }
      
      setFiles([]);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAmountInputChange = (transactionId: string, value: string) => {
    setAmountInputs(prev => ({
      ...prev,
      [transactionId]: value
    }));
  };

  const updateTransactionAmount = async (transactionId: string) => {
    const amount = amountInputs[transactionId];
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setIsUpdatingAmount(prev => ({ ...prev, [transactionId]: true }));
    
    try {
      const res = await axios.put(`http://localhost:5000/api/receipts/update-amount`, {
        transactionId,
        amount: parseFloat(amount)
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Update the transaction in the list
      setUploadedTransactions(prev => 
        prev.map(t => 
          t.id === transactionId 
            ? { ...t, amount: parseFloat(amount), needsAmountInput: false }
            : t
        )
      );

      // Clear the amount input
      setAmountInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[transactionId];
        return newInputs;
      });

      setSuccessMessage("Amount updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to update amount");
    } finally {
      setIsUpdatingAmount(prev => ({ ...prev, [transactionId]: false }));
    }
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "2rem auto",
        padding: "2rem",
        fontFamily: "sans-serif",
      }}
    >
      <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "1.5rem" }}>
        Receipt Upload & Processing
      </h2>

      {/* Success Message */}
      {successMessage && (
        <div
          style={{
            backgroundColor: "#d1fae5",
            border: "1px solid #10b981",
            color: "#065f46",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            textAlign: "center",
            fontWeight: "600"
          }}
        >
          ✅ {successMessage}
        </div>
      )}

      {/* Upload Panel */}
      <div
        style={{
          display: "flex",
          gap: "2rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            flex: 1,
            border: "2px dashed #ccc",
            borderRadius: "10px",
            padding: "2rem",
            textAlign: "center",
            minWidth: "300px",
          }}
        >
          <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}> Upload Receipts</h3>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "1rem" }}>
            Upload your receipts here
            <br />
            <strong>Tip:</strong> Name files like "swiggy_receipt.jpg" for automatic vendor detection
          </p>
          <input
            type="file"
            accept="image/*,application/pdf"
            multiple
            onChange={handleFileChange}
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              borderRadius: "6px",
              width: "100%",
            }}
          />
          {files.length > 0 && (
            <ul
              style={{
                marginTop: "1rem",
                listStyle: "none",
                padding: 0,
              }}
            >
              {files.map((f, i) => (
                <li key={i} style={{ marginBottom: "10px" }}>
                  {f.file.type.startsWith("image") ? (
                    <img
                      src={f.preview}
                      alt="preview"
                      width={100}
                      style={{ borderRadius: "8px" }}
                    />
                  ) : (
                    <p>{f.file.name}</p>
                  )}
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={uploadFiles}
            disabled={isUploading}
            style={{
              backgroundColor: "#10b981",
              color: "#fff",
              padding: "10px 20px",
              marginTop: "1rem",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              width: "100%",
              fontWeight: 600,
            }}
          >
            {isUploading ? "Processing..." : `Upload ${files.length} File(s)`}
          </button>
        </div>

        {/* Recent Transactions Panel */}
        <div
          style={{
            flex: 1,
            minWidth: "300px",
            backgroundColor: "#f9fafb",
            padding: "2rem",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>📄 Recent Transactions</h3>
          {uploadedTransactions.length === 0 ? (
            <p style={{ fontSize: "14px", color: "#555" }}>
              Upload receipts to see recent transactions here.
            </p>
          ) : (
            <div>
              {uploadedTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "1rem",
                    marginBottom: "1rem",
                    backgroundColor: "white",
                  }}
                >
                  <h4>{transaction.description}</h4>
                  <p><strong>Amount:</strong> ₹{transaction.amount}</p>
                  <p><strong>Category:</strong> {transaction.category}</p>
                  <p><strong>Date:</strong> {new Date(transaction.date).toLocaleDateString()}</p>
                  
                  {/* Amount Input Section */}
                  {transaction.needsAmountInput && (
                    <div style={{ 
                      marginTop: "1rem", 
                      padding: "1rem", 
                      backgroundColor: "#fef3c7", 
                      borderRadius: "6px",
                      border: "1px solid #f59e0b"
                    }}>
                      <p style={{ marginBottom: "0.5rem", fontSize: "14px", color: "#92400e" }}>
                        <strong>⚠️ Amount not detected. Please enter manually:</strong>
                      </p>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ fontSize: "14px", color: "#92400e" }}>₹</span>
                        <input
                          type="number"
                          placeholder="Enter amount"
                          value={amountInputs[transaction.id] || ""}
                          onChange={(e) => handleAmountInputChange(transaction.id, e.target.value)}
                          style={{
                            padding: "8px",
                            border: "1px solid #d1d5db",
                            borderRadius: "4px",
                            width: "120px",
                            fontSize: "14px"
                          }}
                        />
                        <button
                          onClick={() => updateTransactionAmount(transaction.id)}
                          disabled={isUpdatingAmount[transaction.id]}
                          style={{
                            backgroundColor: "#059669",
                            color: "white",
                            padding: "8px 12px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600"
                          }}
                        >
                          {isUpdatingAmount[transaction.id] ? "Updating..." : "Update"}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {transaction.ocrSuccess && (
                    <p style={{ color: "#059669", fontSize: "12px" }}>
                      ✅ OCR processed successfully
                    </p>
                  )}
                  <p style={{ color: "#059669", fontSize: "12px" }}>
                    ✅ Transaction created successfully
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div
        style={{
          padding: "2rem",
          border: "1px solid #eee",
          borderRadius: "10px",
          backgroundColor: "#f3f4f6",
        }}
      >
        <h3 style={{ marginBottom: "1rem" }}>How it works:</h3>
        <ol style={{ paddingLeft: "1.5rem" }}>
          <li>Upload your receipt image</li>
          <li>System extracts vendor and category from filename (e.g., "swiggy_receipt.jpg" → Swiggy, Food)</li>
          <li>System tries to extract amount and date using OCR</li>
          <li>If OCR fails to detect amount, you can enter it manually</li>
          <li>Transaction is automatically created with extracted data</li>
          <li>Check the <strong>Transactions</strong> page to see your new transaction</li>
        </ol>
        
        <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#dbeafe", borderRadius: "6px" }}>
          <strong>💡 Naming Tips:</strong>
          <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
            <li><strong>swiggy_receipt.jpg</strong> → Vendor: Swiggy, Category: Food</li>
            <li><strong>amazon_receipt.jpg</strong> → Vendor: Amazon, Category: Shopping</li>
            <li><strong>ola_receipt.jpg</strong> → Vendor: Ola, Category: Travel</li>
            <li><strong>dmart_receipt.jpg</strong> → Vendor: DMart, Category: Grocery</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
