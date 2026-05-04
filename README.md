# Campus Canteen System

A complete full-stack web application for ordering food from a college/campus canteen. This system allows students to skip the queue by ordering ahead and picking up their food during specifically allocated time slots. It also features an admin dashboard for canteen staff to manage incoming orders.

## ✨ Features

* **User Authentication**: Secure sign-up and login system for students and admins.
* **Menu Browsing**: View available food items with prices and real-time stock availability.
* **Cart System**: Add/remove items from the shopping cart.
* **Time Slot Booking**: Select specific pickup times (e.g., 10:15 AM) to manage canteen crowd flow. Slots have maximum capacities.
* **Order Management**: Users can view their order history and current status.
* **Admin Dashboard**: Canteen staff can view all orders, update order statuses (Pending, Preparing, Ready, Completed), and add new items to the menu.
* **Responsive Design**: Modern, mobile-friendly UI that works seamlessly on all devices.

## 🛠️ Tech Stack

### Frontend
* **Framework**: React 18 with TypeScript
* **Build Tool**: Vite
* **Styling**: Tailwind CSS
* **Components**: shadcn/ui & Radix UI
* **Icons**: Lucide React

### Backend
* **Framework**: FastAPI (Python)
* **Database**: SQLite
* **ORM**: SQLAlchemy
* **Authentication**: OAuth2 with bcrypt password hashing

## 📂 Project Structure

```text
Canteen-Project/
├── Backend/                 # FastAPI server and Database logic
│   ├── database.py          # Database connection setup
│   ├── main.py              # Main FastAPI application and API routes
│   ├── models.py            # SQLAlchemy database models
│   ├── schemas.py           # Pydantic schemas for data validation
│   └── seed.py              # Script to seed initial menu data
├── Frontend/                # React Single Page Application
│   ├── public/              # Static assets
│   └── src/                 
│       ├── components/      # Reusable UI components
│       ├── context/         # React context (Auth & Cart)
│       ├── pages/           # Application pages (Home, Menu, Checkout, Admin, etc.)
│       └── lib/             # Utility functions and API client
└── README.md
```

## 🚀 Setup and Installation

### Prerequisites
* **Node.js** (v18 or higher)
* **Python** (v3.8 or higher)

### 1. Clone the repository
```bash
git clone https://github.com/KandadiCharanTej/Canteen-Project.git
cd Canteen-Project
```

### 2. Frontend Setup (Build the UI)
The backend is configured to serve the built static files of the frontend. First, we need to compile the React app.
```bash
cd Frontend
npm install
npm run build
cd ..
```
*Note: The `npm run build` command generates a `dist` folder inside `Frontend/` which the backend will serve.*

### 3. Backend Setup
Open a new terminal in the `Backend` directory.
```bash
cd Backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 4. Run the Application
Make sure your virtual environment is active in the `Backend` folder, then start the FastAPI server:
```bash
python -m uvicorn main:app --reload
```

The application will now be running! Open your browser and navigate to:
**http://127.0.0.1:8000**

## 🌐 API Endpoints Overview

The FastAPI backend exposes the following RESTful endpoints (view full interactive docs at `http://127.0.0.1:8000/docs` when the server is running):

* `POST /signup` - Register a new user.
* `POST /login` - Authenticate and receive a token.
* `GET /menu` - Retrieve all active menu items.
* `POST /menu` - Add a new menu item (Admin only).
* `GET /slots` - Get available pickup time slots and their capacities.
* `POST /orders` - Place a new order for a specific time slot.
* `GET /orders` - View user's orders (or all orders if Admin).
* `PUT /orders/{order_id}` - Update the status of an order (Admin only).

## 📝 License
This project is open-source and available under the MIT License.
