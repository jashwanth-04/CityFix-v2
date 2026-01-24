# 🏙️ CityFix

### **Civic Complaint Management System**

> *Bridging the gap between citizens and municipal authorities – one report at a time.*

---

## 📖 About The Project

**CityFix** is a robust web application designed to streamline the process of reporting and resolving civic issues. By providing a direct channel between citizens and administration, it ensures that grievances like potholes, garbage accumulation, or street light failures are reported, tracked, and resolved efficiently.

This "Major Project" demonstrates a full-stack implementation of a real-world problem-solving tool, featuring secure authentication, image handling, and role-based dashboards.

---

## ✨ Key Features

### 👤 For Citizens
- **Easy Reporting**: Submit complaints with detailed descriptions, locations, and photo evidence.
- **Track Status**: view the real-time status of submitted complaints (Pending, In Progress, Resolved).
- **Secure Access**: Personal dashboard to manage and review history.

### 🛡️ For Administrators
- **Centralized Dashboard**: View all incoming complaints in one place.
- **Status Management**: Update the lifecycle of a complaint as it gets processed.
- **Evidence Review**: Access uploaded photos to verify issues before dispatching teams.

### 🔐 Technical Highlights
- **Role-Based Authentication**: Secure JWT-based login for separate Citizen and Admin flows.
- **Image Processing**: Efficient handling of photo uploads using Multer.
- **Responsive Design**: Built with React and Vite for a seamless experience on modern devices.

### 🛡️ Security Features
- **Rate Limiting**: Protects against brute force attacks and API abuse
  - Auth endpoints: 5 requests per 15 minutes (prevents credential stuffing)
  - API endpoints: 100 requests per 15 minutes
  - Complaint creation: 10 per hour (prevents spam)
- **Input Validation**: Schema-based validation using Joi with XSS sanitization
- **Security Headers**: Helmet middleware for XSS, clickjacking, and MIME sniffing protection
- **NoSQL Injection Prevention**: MongoDB query sanitization using express-mongo-sanitize
- **Secure Error Handling**: Generic error messages in production (no stack traces leaked)
- **Environment Validation**: Startup checks for required security configuration

---

## 🛠️ Tech Stack

This project uses the **MERN** stack for a unified JavaScript development experience.

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) | Fast, responsive UI with client-side routing. |
| **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white) | RESTful API architecture. |
| **Database** | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white) | NoSQL database for flexible data storage. |
| **Auth** | ![JWT](https://img.shields.io/badge/JWT-black?style=flat&logo=jsonwebtokens) | Stateless authentication security. |

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v14+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URL)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/jashwanth-lgtm/CityFix.git
    cd CityFix
    ```

2.  **Setup Backend (Server)**
    ```bash
    cd server
    npm install
    ```
    *Create a `.env` file in the `server` directory (see `.env.example` for template):*
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secure_random_secret_at_least_32_chars
    PORT=5000
    NODE_ENV=development
    ```
    
    > ⚠️ **Security Note**: Generate a strong JWT_SECRET using:
    > ```bash
    > node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    > ```
    
    *(Optional) Run the seed script to create test users:*
    ```bash
    node seed.js
    ```

3.  **Setup Frontend (Client)**
    ```bash
    cd ../client
    npm install
    ```

### Running the App

**1. Start the Backend Server**
```bash
# In the /server directory
npm run dev
```
> Server will run on `http://localhost:5000`

**2. Start the Frontend Application**
```bash
# In the /client directory
npm run dev
```
> Client will run on `http://localhost:5173` (or similar)

---

## 📸 Usage

1.  **Login**: Use the toggle to switch between **Citizen** and **Admin** login.
    *   *Demo Citizen credentials*: `citizen@test.com` / `Password123!`
    *   *Demo Admin credentials*: `admin@test.com` / `Password123!`
2.  **Report**: As a citizen, click "New Complaint", fill details, and upload a photo.
3.  **Manage**: Log out and log in as Admin to see the new complaint and change its status.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

<div align="center">
  <sub>Built with ❤️ by Jashwanth </sub>
</div>
