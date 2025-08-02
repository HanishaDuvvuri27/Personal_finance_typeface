# Personal Finance ([demo](https://drive.google.com/file/d/1iAd15Bg_OX460mAKATHLSgZMgbWSpZ4L/view?usp=sharing))



Personal Finance is a full-stack web application that allows users to track and categorize their expenses. It provides manual and OCR-based receipt entry, analytics, and user authentication.

---

## Features

###  Authentication
- User registration and login (JWT-based).
- Auth middleware to protect private routes.

###  Expense Tracking
- Add expenses manually via form.
- Upload receipts (images or PDFs) to auto-extract merchant name, date, and amount using Tesseract.js OCR.
- Transactions are stored and linked to users.

###  Analytics
- Track total expenses, income, and top categories.
- Visual summary on dashboard.

###  Categories
- Auto-tagging of transactions into default categories like Food, Shopping, Travel, etc.
- Manual category adjustments.

###  Upload System
- OCR parser reads receipt content (not filenames).
- Fallback default: Adds a dummy transaction (Flipkart, ₹2198, Shopping, current date) if no data extracted.

---

## Tech Stack

### Backend
- Node.js + Express
- MongoDB (Atlas)
- JWT Authentication
- Tesseract.js (OCR)
- Multer (File upload)

### Frontend
- React + Vite + TypeScript
- React Hook Form + Zod
- Axios + React Query
- Basic CSS (no Tailwind)
- Chart.js for analytics

---

## Folder Structure

```

Personal_finance_typeface/
├── backend/
│   ├── controllers/       # Logic for auth, transactions, analytics
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API route definitions
│   ├── middleware/        # JWT auth middleware
│   ├── utils/             # OCR + helpers
│   ├── uploads/           # Uploaded receipt storage
│   ├── app.js             # Entry point
│   └── package.json       # Backend dependencies
├── frontend/
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Global state (auth)
│   │   ├── pages/         # Screens (Dashboard, Add, Upload, etc.)
│   │   ├── services/      # API calls
│   │   ├── hooks/         # Custom React hooks
│   │   └── assets/        # Icons, logos, etc.
└── README.md              # You're reading it!

````

---

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas URI

### 1. Clone the Repo
```bash
[git clone https://github.com/HanishaDuvvuri27/Personal_finance_typeface.git]
cd Personal_finance_typeface
````

### 2. Set up Backend

```bash
cd backend
npm install
# Create a .env file:
touch .env
```

`.env` format:

```
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-secret-key>
PORT=5000
```

To run:

```bash
npm run dev
```

### 3. Set up Frontend

```bash
cd ../frontend
npm install
npm run dev
```

---

## API Endpoints

| Method | Route                 | Description                  |
| ------ | --------------------- | ---------------------------- |
| POST   | `/api/auth/register`  | Register new user            |
| POST   | `/api/auth/login`     | Login and get JWT            |
| GET    | `/api/transactions`   | Get user's transactions      |
| POST   | `/api/transactions`   | Add new transaction manually |
| POST   | `/api/receipt/upload` | Upload and parse receipt     |
| GET    | `/api/analytics`      | Get analytics summary        |

---

## Bonus Features

* [x] Receipt Parsing (OCR)
* [x] Default transaction fallback on failure
* [x] Expense categorization
* [x] Pagination-ready APIs


---

Author
## HANISHA DUVVURI


