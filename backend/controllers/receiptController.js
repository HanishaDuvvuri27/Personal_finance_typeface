const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const Transaction = require("../models/Transaction");
const Category = require("../models/Category");

// Helper function to extract date from OCR text
const extractDateFromText = (text) => {
  console.log(" Analyzing OCR text for date");
  
  const patterns = [
    /\b(\d{4}-\d{2}-\d{2})\b/, // YYYY-MM-DD
    /\b(\d{2}\/\d{2}\/\d{4})\b/, // MM/DD/YYYY
    /\b(\d{2}-\d{2}-\d{4})\b/, // MM-DD-YYYY
    /\b(\d{2}\.\d{2}\.\d{4})\b/, // MM.DD.YYYY
    /DATE[:\s]*(\d{4}-\d{2}-\d{2})/i,
    /DATE[:\s]*(\d{2}\/\d{2}\/\d{4})/i,
    /DATE[:\s]*(\d{2}-\d{2}-\d{4})/i,
    /RECEIPT[:\s]*(\d{4}-\d{2}-\d{2})/i,
    /RECEIPT[:\s]*(\d{2}\/\d{2}\/\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let dateStr = match[1];
      console.log(" Found date pattern:", dateStr);
      
      // Handle MM/DD/YYYY format
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const month = parseInt(parts[0]);
          const day = parseInt(parts[1]);
          
          if (month > 12) {
            // DD/MM/YYYY format
            dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          } else {
            // MM/DD/YYYY format
            dateStr = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
          }
        }
      }
      
      // Handle MM-DD-YYYY format
      if (dateStr.includes('-') && dateStr.split('-')[0].length === 2) {
        const parts = dateStr.split('-');
        const month = parseInt(parts[0]);
        const day = parseInt(parts[1]);
        
        if (month > 12) {
          // DD-MM-YYYY format
          dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        } else {
          // MM-DD-YYYY format
          dateStr = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
      }
      
      // Validate the date
      const dateObj = new Date(dateStr);
      if (!isNaN(dateObj.getTime()) && dateObj.getFullYear() > 2000 && dateObj.getFullYear() < 2030) {
        console.log("✅ Valid date extracted:", dateStr);
        return dateStr;
      }
    }
  }
  
  console.log("❌ No valid date found in receipt text");
  return null;
};

// Helper function to extract amount from OCR text
const extractAmountFromText = (text) => {
  console.log(" Analyzing OCR text for amount");
  
  const patterns = [
    /(?:Rs\.?|₹)\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
    /(\d+(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:Rs\.?|₹)/i,
    /TOTAL[:\s]*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
    /AMOUNT[:\s]*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
    /GRAND TOTAL[:\s]*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
    /(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i  // Last resort - any number
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (amount > 0 && amount < 1000000) { // Reasonable amount range
        console.log("✅ Valid amount extracted:", amount);
        return amount;
      }
    }
  }
  
  console.log("❌ No valid amount found in receipt text");
  return null;
};

// Helper function to extract vendor from filename
const extractVendorFromFilename = (filename) => {
  console.log(" Analyzing filename for vendor:", filename);
  
  const fileName = filename.toLowerCase();
  let vendor = "Receipt";
  let categoryName = "Others";

  // Try to extract vendor info from filename
  if (fileName.includes("swiggy")) {
    vendor = "Swiggy";
    categoryName = "Food";
  } else if (fileName.includes("walmart")) {
    vendor = "Walmart";
    categoryName = "Shopping";
  } else if (fileName.includes("amazon")) {
    vendor = "Amazon";
    categoryName = "Shopping";
  } else if (fileName.includes("dmart")) {
    vendor = "DMart";
    categoryName = "Grocery";
  } else if (fileName.includes("ola")) {
    vendor = "Ola";
    categoryName = "Travel";
  } else if (fileName.includes("uber")) {
    vendor = "Uber";
    categoryName = "Travel";
  } else if (fileName.includes("zomato")) {
    vendor = "Zomato";
    categoryName = "Food";
  } else if (fileName.includes("flipkart")) {
    vendor = "Flipkart";
    categoryName = "Shopping";
  } else if (fileName.includes("myntra")) {
    vendor = "Myntra";
    categoryName = "Shopping";
  } else if (fileName.includes("bigbasket")) {
    vendor = "BigBasket";
    categoryName = "Grocery";
  } else if (fileName.includes("dominos")) {
    vendor = "Dominos";
    categoryName = "Food";
  } else if (fileName.includes("pizza")) {
    vendor = "Pizza";
    categoryName = "Food";
  } else if (fileName.includes("restaurant")) {
    vendor = "Restaurant";
    categoryName = "Food";
  } else if (fileName.includes("cafe")) {
    vendor = "Cafe";
    categoryName = "Food";
  } else if (fileName.includes("petrol")) {
    vendor = "Petrol";
    categoryName = "Transport";
  } else if (fileName.includes("fuel")) {
    vendor = "Fuel";
    categoryName = "Transport";
  } else if (fileName.includes("medical")) {
    vendor = "Medical";
    categoryName = "Healthcare";
  } else if (fileName.includes("pharmacy")) {
    vendor = "Pharmacy";
    categoryName = "Healthcare";
  } else if (fileName.includes("movie")) {
    vendor = "Movie";
    categoryName = "Entertainment";
  } else if (fileName.includes("cinema")) {
    vendor = "Cinema";
    categoryName = "Entertainment";
  }

  console.log("✅ Vendor extracted:", vendor);
  console.log("✅ Category extracted:", categoryName);
  
  return { vendor, categoryName };
};

// Helper function to guess category from vendor
const guessCategory = (vendor) => {
  const vendorLower = vendor.toLowerCase();
  const map = {
    swiggy: "Food",
    zomato: "Food",
    dominos: "Food",
    pizza: "Food",
    restaurant: "Food",
    cafe: "Food",
    walmart: "Shopping",
    target: "Shopping",
    costco: "Shopping",
    ola: "Travel",
    uber: "Travel",
    taxi: "Travel",
    dmart: "Grocery",
    bigbasket: "Grocery",
    grocery: "Grocery",
    supermarket: "Grocery",
    amazon: "Shopping",
    flipkart: "Shopping",
    myntra: "Shopping",
    shopping: "Shopping",
    petrol: "Transport",
    diesel: "Transport",
    fuel: "Transport",
    gas: "Transport",
    medical: "Healthcare",
    hospital: "Healthcare",
    pharmacy: "Healthcare",
    medicine: "Healthcare",
    movie: "Entertainment",
    cinema: "Entertainment",
    netflix: "Entertainment",
    prime: "Entertainment"
  };
  
  for (const key in map) {
    if (vendorLower.includes(key)) return map[key];
  }
  return "Others";
};

// Main controller function
exports.processReceipt = async (req, res) => {
  let filePath = null;
  
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    console.log("✅ File received:", file.originalname);
    console.log("✅ File size:", file.size, "bytes");
    filePath = file.path;

    // Check if file exists and is readable
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ message: "Uploaded file not found" });
    }

    console.log("✅ File exists and is readable");

    let extractedDate = null;
    let extractedAmount = null;
    let ocrSuccess = false;

    // Try OCR first
    try {
      console.log("🔄 Attempting OCR...");
      
      const formData = new FormData();
      formData.append("file", fs.createReadStream(filePath));
      formData.append("language", "eng");
      formData.append("isOverlayRequired", "false");
      formData.append("OCREngine", "2");

      const { data } = await axios.post("https://api.ocr.space/parse/image", formData, {
        headers: {
          apikey: "K89611266888957",
          ...formData.getHeaders(),
        },
        timeout: 15000, // 15 second timeout
      });

      const parsedText = data?.ParsedResults?.[0]?.ParsedText || "";
      console.log("📄 Raw OCR text:", parsedText.substring(0, 200) + "...");

      if (parsedText) {
        extractedDate = extractDateFromText(parsedText);
        extractedAmount = extractAmountFromText(parsedText);
        ocrSuccess = true;
        console.log("✅ OCR successful - extracted data:", { date: extractedDate, amount: extractedAmount });
      } else {
        console.log("❌ OCR returned no text");
      }

    } catch (ocrError) {
      console.log("❌ OCR failed:", ocrError.message);
      console.log("🔄 Falling back to manual input...");
    }

    // Generate unique filename for storage
    const timestamp = Date.now();
    const newFilename = `${timestamp}_${file.originalname}`;
    const newPath = `uploads/${newFilename}`;

    // Move file to permanent location
    fs.renameSync(filePath, newPath);
    console.log("✅ File saved to:", newPath);

    // Extract vendor and category from filename
    const { vendor, categoryName } = extractVendorFromFilename(file.originalname);

    // Find or create category
    let category = await Category.findOne({ 
      userId: req.user._id, 
      name: categoryName,
      type: "expense" 
    });

    if (!category) {
      console.log("📁 Creating new category:", categoryName);
      category = new Category({
        userId: req.user._id,
        name: categoryName,
        type: "expense",
        color: "#3B82F6",
        icon: "💰"
      });
      await category.save();
      console.log("✅ Category created");
    } else {
      console.log("✅ Category found:", category.name);
    }

    // Create transaction with extracted data (amount will be 0 if OCR failed)
    const transaction = new Transaction({
      userId: req.user._id,
      type: "expense",
      amount: extractedAmount || 0,
      description: vendor, // Use extracted vendor as description
      categoryId: category._id, // Use extracted category
      date: extractedDate ? new Date(extractedDate) : new Date(),
      receiptUrl: newFilename,
      notes: ocrSuccess ? "Receipt processed with OCR" : "Receipt uploaded - OCR failed, amount needs manual input"
    });

    await transaction.save();
    console.log("✅ Transaction created successfully:", transaction._id);

    res.json({ 
      message: ocrSuccess ? "Receipt processed successfully!" : "Receipt uploaded! Please enter the amount manually.",
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        description: transaction.description,
        category: category.name,
        date: transaction.date,
        receiptUrl: newFilename,
        ocrSuccess: ocrSuccess,
        extractedDate: extractedDate,
        extractedAmount: extractedAmount,
        needsAmountInput: !extractedAmount // Flag to indicate if amount needs manual input
      },
      extractedData: {
        vendor: vendor,
        category: categoryName,
        date: extractedDate,
        amount: extractedAmount,
        ocrSuccess: ocrSuccess
      }
    });

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    
    // Clean up file if it exists
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log("✅ File cleaned up after error");
      } catch (cleanupErr) {
        console.error("❌ Failed to cleanup file:", cleanupErr.message);
      }
    }

    res.status(500).json({ 
      message: "Receipt upload failed", 
      error: err.message
    });
  }
};

// New function to update transaction amount
exports.updateTransactionAmount = async (req, res) => {
  try {
    const { transactionId, amount } = req.body;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    // Find the transaction
    const transaction = await Transaction.findOne({ _id: transactionId, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Update transaction with new amount
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, userId: req.user._id },
      { 
        amount: parseFloat(amount),
        notes: "Amount updated manually after receipt upload",
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({ 
      message: "Transaction amount updated successfully!",
      transaction: {
        id: updatedTransaction._id,
        amount: updatedTransaction.amount,
        description: updatedTransaction.description,
        date: updatedTransaction.date,
        notes: updatedTransaction.notes
      }
    });

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    res.status(500).json({ 
      message: "Failed to update transaction amount", 
      error: err.message
    });
  }
};

// Function to update transaction with description and create category
exports.updateTransactionFromReceipt = async (req, res) => {
  try {
    const { transactionId, description } = req.body;
    
    if (!description || description.trim() === "") {
      return res.status(400).json({ message: "Description is required" });
    }

    // Find the transaction
    const transaction = await Transaction.findOne({ _id: transactionId, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Determine category based on description
    const categoryName = guessCategory(description);

    // Find or create category
    let category = await Category.findOne({ 
      userId: req.user._id, 
      name: categoryName,
      type: "expense" 
    });

    if (!category) {
      console.log("📁 Creating new category:", categoryName);
      category = new Category({
        userId: req.user._id,
        name: categoryName,
        type: "expense",
        color: "#3B82F6",
        icon: "💰"
      });
      await category.save();
    }

    // Update transaction with description and category
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, userId: req.user._id },
      { 
        description: description.trim(),
        categoryId: category._id,
        notes: "Receipt processed successfully",
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({ 
      message: "Transaction updated successfully!",
      transaction: {
        id: updatedTransaction._id,
        amount: updatedTransaction.amount,
        description: updatedTransaction.description,
        category: category.name,
        date: updatedTransaction.date,
        notes: updatedTransaction.notes
      }
    });

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    res.status(500).json({ 
      message: "Failed to update transaction", 
      error: err.message
    });
  }
};

