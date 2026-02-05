# 🍽️ Surplus Food Management System

A secure, real-time web application built using the **MERN stack** to reduce food waste by connecting **food donors**, **NGOs**, and **volunteers**. The platform enables efficient listing, allocation, pickup, and tracking of surplus food with real-time updates and impact analytics.

---

## 🚀 Features

### 🔐 Authentication & Security

* JWT-based authentication
* Role-based access control (Donor / NGO / Volunteer / Admin)
* Secure password hashing

### 🥗 Surplus Food Management

* Create and manage surplus food listings
* Automatic expiry timers for food safety
* Quantity, food type, and pickup time details

### 🚚 Pickup & Volunteer Allocation

* Intelligent volunteer allocation
* Pickup scheduling system
* Live location tracking for volunteers

### 📊 Impact Dashboard

* Meals saved
* Food waste reduced (in kg)
* CO₂ emissions reduced
* Donation and pickup statistics

### ⚡ Real-Time Updates

* Live status updates using WebSockets
* Instant notifications for donors and NGOs

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Redux
* Bootstrap
* Axios

### Backend

* Node.js
* Express.js
* JWT Authentication
* WebSockets (Socket.IO)

### Database

* MongoDB
* Mongoose ODM

### Others

* Google Maps API (Location tracking)
* Cloudinary / AWS S3 (Image uploads)

---

## 📂 Project Structure

```
surplus-food-management/
├── client/            # React frontend
├── server/            # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── config/
├── .env
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

* Node.js (v16+)
* MongoDB
* Git

### Steps

1. **Clone the repository**

```bash
git clone https://github.com/your-username/surplus-food-management.git
cd surplus-food-management
```

2. **Backend setup**

```bash
cd server
npm install
npm start
```

3. **Frontend setup**

```bash
cd client
npm install
npm start
```

4. **Environment Variables (.env)**

```
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
MAPS_API_KEY=your_google_maps_key
```

---

## 👥 User Roles

* **Donor** – Lists surplus food
* **NGO** – Requests and manages donations
* **Volunteer** – Picks up and delivers food
* **Admin** – Manages users and platform data

---

## 📈 Impact Goals

* Reduce food waste
* Accelerate food distribution
* Support NGOs and communities
* Promote sustainability and social responsibility

---

## 🧪 Future Enhancements

* AI-based demand prediction
* Mobile application (React Native)
* Multi-language support
* Rating system for donors and volunteers

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Submit a pull request

## Together, let’s reduce food waste and feed more people 🌍
