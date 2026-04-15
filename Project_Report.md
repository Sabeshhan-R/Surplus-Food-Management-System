# SURPLUS FOOD MANAGEMENT SYSTEM - PROJECT REPORT

## ABSTRACT
The Surplus Food Management System is a comprehensive web application designed to bridge the gap between surplus food generators (like restaurants, event organizers, and households) and those in need, facilitated through Non-Governmental Organizations (NGOs) and registered volunteers. Driven by the core technologies of the MERN stack—specifically React.js for the frontend, Node.js and Express.js for the backend, and MongoDB for database management—the project addresses the critical dual problem of food wastage and food insecurity. By providing a real-time platform where donors can list surplus edible food, the system allows NGOs to claim the listings and volunteers to manage the logistics of pickup and delivery. Key features include role-based dashboards (Donor, NGO, Volunteer), real-time notification alerts, automated food listing tracking (Pending, Assigned, In Transit, Picked Up), and location-based coordination. The outcome of implementation is a streamlined, scalable, and user-friendly digital ecosystem that ensures timely redistribution of food, minimizes environmental impact from food waste, and fosters community-driven charity.

---

## TABLE OF CONTENTS
1. Introduction
2. Problem Statement
3. System Requirements
4. Technologies Used
5. System Design & Architecture
6. Database Design
7. Frontend Development
8. Backend Development
9. API Design & Integration
10. Results & Screenshots
11. Conclusion
12. Future Enhancements
13. References
14. Appendix / Annexure (Source code)

---

## 1. INTRODUCTION

### Background of the Project
Food wastage is a growing global concern, with millions of tons of edible food being discarded daily by restaurants, banquet halls, and households. Simultaneously, a significant portion of the population suffers from hunger and malnutrition. The discrepancy between surplus food generation and food scarcity creates an urgent need for an intermediary conduit. The Surplus Food Management System serves as this digital conduit, leveraging modern web technologies to create a transparent, real-time ecosystem connecting food donors with food distributors.

### Need for the Application
Historically, food donation has been hampered by logistical inefficiencies. Event organizers or restaurants with excess food often lack the immediate contacts required to distribute the food before it spoils. NGOs, on the other hand, struggle to locate available food sources dynamically. Traditional communication methods like phone calls or manual coordination are too slow for highly perishable goods. Therefore, an automated application is needed to digitize the discovery, claiming, and logistical tracking of surplus food, reducing the turnaround time from hours to mere minutes.

### Objective of the Application
The primary objective of this application is to:
- Establish a seamless digital connection between Donors, NGOs, and Volunteers.
- Provide an intuitive platform for Donors to list food with detailed descriptions (type, quantity, expiry).
- Enable NGOs and Volunteers to track, claim, and update the status of food logistics.
- Reduce food waste efficiently and sustainably while contributing to societal well-being.
- Implement robust authentication to ensure the safety and reliability of the platform's users.

### Overview of Modules
The system is bifurcated into several distinct modules based on user roles and core functionalities:
1. **Authentication Module:** Handles secure registration and login using JWT (JSON Web Tokens) or session-based verification, segregating users into four primary roles: Donor, NGO, Volunteer, and Admin.
2. **Donor Dashboard:** Allows donors to create, read, update, and delete (CRUD) their food listings. Displays metrics such as total donations, pending pickups, and successful meal distributions.
3. **NGO/Volunteer Dashboard:** Empowers distributors to view available local food listings, claim tasks, and update the delivery status (Assign -> In Transit -> Picked Up).
4. **Notification Module:** A real-time or polling-based alert system informing users of status changes (e.g., when a volunteer picks up a donation).
5. **Admin Module (Optional/Implicit):** For system monitoring, user verification, and overall platform administration.

---

## 2. PROBLEM STATEMENT

### Existing Issues
In the current manual ecosystem, surplus food management suffers from several critical bottlenecks:
- **Lack of Information Symmetry:** Donors do not know who needs the food, and hungry populations/NGOs do not know where the surplus food is located.
- **Time Sensitivity:** Food is highly perishable. By the time a matching donor and NGO find each other manually, the food often expires or is deemed unsafe for consumption.
- **Logistical Inefficiencies:** Coordinating a volunteer or delivery mechanism requires extensive back-and-forth communication which is highly prone to delays and errors.
- **Lack of Transparency:** There is no centralized tracking matrix to ascertain if the food actually reached the intended beneficiaries.

### Need for Automation / Digitization
To overcome the physical and temporal barriers of food distribution, automation is strictly required. Digitization converts the ad-hoc process into a structured workflow. It offers instantaneous broadcasting algorithms where a single food listing can be viewed by all local NGOs simultaneously. Furthermore, digital status updates (like a package tracker) ensure accountability for the delivery personnel (volunteers).

### Expected Solution
Our application solves this by offering a responsive web portal where the lifecycle of surplus food is meticulously tracked. The expected solution includes robust user authentication, a centralized database to handle concurrent listings, real-time status modifications, and a streamlined UI/UX that requires minimal technical prowess to operate, ensuring high adoption rates among local restaurants and charities.

---

## 3. SYSTEM REQUIREMENTS

### 3.1 Software Requirements
- **Operating System:** Windows 10/11, macOS, or Linux distributions (Ubuntu, Fedora).
- **IDE:** Visual Studio Code (VS Code) or WebStorm.
- **Frontend Technologies:** HTML5, CSS3, Bootstrap 5, React.js (v19), React-Router-DOM, React-Bootstrap, Lucide-React (Icons).
- **Backend Technologies:** Node.js, Express.js (v5).
- **Database:** MongoDB (using Mongoose ODM v9).
- **Browser:** Google Chrome, Mozilla Firefox, Safari, or Microsoft Edge.
- **Version Control:** Git & GitHub.
- **Package Manager:** NPM (Node Package Manager) or Yarn.

### 3.2 Hardware Requirements
- **Processor:** Dual-Core Processor (Intel Core i3 / AMD Ryzen 3 or higher).
- **RAM:** Minimum 4GB RAM (8GB recommended for running IDE, Browser, and Local Database concurrently).
- **Storage:** Minimum 40GB HDD/SSD (approx. 1GB for project files and dependencies, the rest for OS and tools).
- **Internet:** Stable internet connection required to fetch NPM packages and utilize CDN resources.

---

## 4. TECHNOLOGIES USED

### Frontend: React, HTML, CSS, React-Bootstrap
The user interface is built as a Single Page Application (SPA) leveraging **React.js**. React's component-based architecture allows for the reusability of UI elements like forms, tables, and modal dialogs. **React-Bootstrap** is heavily utilized to inject responsive design principles, ensuring the system is equally accessible on mobile phones and desktop displays without writing extensive custom media queries. **CSS3** is applied for specific styling nuances (like `index.css` and `style.css`), complementing the framework. **Lucide React** provides vector icons for visually appealing actions and navigation cues.

### Backend: Node.js (Express)
**Node.js** serves as the asynchronous JavaScript runtime, while **Express.js** acts as the web application framework. Express is utilized to establish the RESTful internal API, manage routing logic, parse incoming JSON payloads (`app.use(express.json())`), and handle Cross-Origin Resource Sharing (`cors`). It orchestrates the business logic between the client HTTP requests and the database operations seamlessly.

### Database: MongoDB
**MongoDB**, a NoSQL document-based database, is the primary data store. It guarantees high availability, horizontal scalability, and a flexible schema design. Documents are stored in BSON format, making it structurally analogous to JSON. **Mongoose**, an Object Data Modeling (ODM) library, wraps MongoDB to enforce schema validation (e.g., distinguishing string names, number quantities, and enum validation for user roles and listing status) and simplifies querying.

### API Communication: REST / JSON
The system follows Representational State Transfer (REST) protocols. Client-server data interchange relies strictly on JSON over HTTP methods (GET for fetching data, POST for creating listings/users, PUT/PATCH for updating status, DELETE for wiping obsolete records).

### Version Control & Tooling: Git, GitHub, Vite
**Git** tracks file modifications across the development lifecycle, preserving project history. **GitHub** remote repositories serve as the backup and collaboration nexus. The frontend build pipeline is supercharged by **Vite**, eclipsing older bundlers like Webpack in terms of Hot Module Replacement (HMR) speeds and optimized local server spin-ups.

---

## 5. SYSTEM DESIGN & ARCHITECTURE

The project employs a classical **Three-Tier Architecture (Client-Server-Database Model)**:

1. **Presentation Layer (Frontend - React):** Contains all the Dashboards (Donor, NGO, Volunteer) and the Authentication pages. Interacts with the user, validates input dynamically, and issues HTTP requests to the server structure via Axios.
2. **Business Logic Layer (Backend - Express):** Listens on port 5000. It receives REST API calls, applies business policies (e.g., a non-authorized user cannot delete a listing), interfaces with Mongoose models, and returns structured HTTP responses with standardized status codes (200, 201, 400, 404, 500).
3. **Data Access Layer (Database - MongoDB):** Stores all persistent entities: Users, Food Listings, and Notifications within specific collections.

*(Note: In a standard physical report, this section would include graphical diagrams. Below is a text-based representation of the interactions).*

### Data Flow Overview
- **User** opens Browser.
- Browser loads React app via Vite server (Port 5173).
- React components render and use `useEffect` to trigger Axios `GET` requests for Dashboard data.
- Request reaches Node Express server (Port 5000) configured with `/api/listings` endpoints.
- Express route invokes Mongoose functions (e.g., `FoodListing.find()`).
- Mongoose queries the MongoDB instance (`mongodb://localhost:27017/surplus_food`).
- Data is returned as an array of JSON objects, sent back to React.
- React updates the local state (`useState`), triggering a DOM re-render, displaying the active listings to the user.

---

## 6. DATABASE DESIGN

The NoSQL MongoDB database, `surplus_food`, contains three primary schemas defined via Mongoose.

### 6.1 Users Collection Schema (`User.js`)
Stores credential and profile information for all system participants.
- `_id`: ObjectId (Auto-generated).
- `fullName`: String (Required, trim applied).
- `email`: String (Required, Unique, lowercase).
- `password`: String (Required, hashed via bcryptjs with a minlength of 8).
- `role`: String (Enum: ['Donor', 'NGO', 'Volunteer', 'Admin'], Default: 'Donor').
- `location`: Structure containing `type` (Point) and `coordinates` ([longitude, latitude]) with a '2dsphere' index for geospatial queries.
- `createdAt`: Date (Defaults to `Date.now`).

### 6.2 Food Listings Collection Schema (`FoodListing.js`)
Houses the core transactional data regarding available food resources.
- `_id`: ObjectId.
- `item`: String (Required, name of the food like 'Rice Bowl').
- `quantity`: Number (Required, minimum 1).
- `type`: String (Enum: ['Cooked Meal', 'Groceries', 'Fruits', 'Bakery']).
- `expiry`: Date (Required, expiration timestamp).
- `status`: String (Enum: ['Pending', 'Assigned', 'In Transit', 'Picked Up', 'Rejected'], Default: 'Pending').
- `volunteer`: String (Name or ID of assigned volunteer, Default: 'Not Assigned').
- `donor`: ObjectId (Reference to `User` model, Required).
- `location` & `volunteerLocation`: Geospatial Point structures mirroring the User schema.
- `createdAt`: Date.

### 6.3 Notifications Collection Schema (`Notification.js`)
Facilitates the localized alert system for individual users.
- `_id`: ObjectId.
- `userId`: String (Required, foreign reference to User `_id`).
- `text`: String (Required, alert descriptive text).
- `time`: String (Default: 'Just now').
- `createdAt`: Date.

### Relationship Mapping
While MongoDB is fundamentally relationship-agnostic (non-relational), the ODM defines a logical One-to-Many association:
- **1 User (Donor)** can have **Many FoodListings**. Handled via the `donor` field referencing the User's `ObjectId`.
- **1 User** can have **Many Notifications**. Handled via the `userId` relational tie.

---

## 7. FRONTEND DEVELOPMENT

The React application (`src/App.jsx`) implements client-side rendering with standard layouts and modular components.

### UI Layout & Navigation
The React Router Dom library seamlessly switches between views without triggering a page reload. 
- The root route `/` intercepts and redirects automatically using `<Navigate to="/auth" />`.
- Context-sensitive layouts display Navigation bars that present the current User's Name and a Logout mechanism dynamically rendering based on localStorage token evaluation.
- `DonorDashboard.jsx`, `NgoDashboard.jsx`, and `VolunteerDashboard.jsx` act as the primary structural containers for domain-specific tasks.

### Component Implementation (`DonorDashboard` Example)
The Donor Dashboard utilizes a Tab-based interface via internal React state `setActiveTab` ('overview', 'listings', 'notifications').
- **Overview View:** Summarizes analytics leveraging `reduce()` and `filter()` functions to display High-Level statistical Cards (e.g., Total Donations, Meals Saved, Pending Pickups). Recent activities are plotted on a responsive Bootstrap table.
- **Listings View:** A dedicated Data Grid with inline actions to Edit (Pops open a React-Bootstrap `Modal` Form setting `editingListing` state) or Delete (prompts a window validation before API deletion).
- **Notifications View:** Renders dismissible alert components fetching data periodically (Polling via `setInterval(..., 3000)` inside a `useEffect` hook).

### CSS/Bootstrap Styling
Responsive structures are implemented using grid `<Container>`, `<Row>`, and `<Col>`. Visual feedback utilizes pre-defined variant styling such as `bg-success`, `text-muted`, and context-specific badges (`Warning` for Pending status, `Success` for Picked Up). Micro-interactions are handled seamlessly natively without extensive raw CSS overriding.

---

## 8. BACKEND DEVELOPMENT

Built on Node.js utilizing the Express microframework (`server.js`).

### Server Setup & Routing
- The server initiates by instantiating an Express application and loading environment variables via `dotenv` (`process.env.PORT` or `5000`).
- Global middleware including `cors()` and `express.json()` ensure requests from the frontend Origin port are deciphered smoothly.
- MongoDB connection is established globally using `mongoose.connect()`.

### Authentication & Security
- **Registration (`/api/auth/register`):** Destructures payload body, checks the DB for duplication via `User.findOne({ email })`. Uses Pre-Save hooks in `User.js` Mongoose Model to intercept and universally Hash passwords using `bcryptjs` (salt round of 12) before permanent storage safely mitigating plaintext data-breaches.
- **Login (`/api/auth/login`):** Validates existence and checks password hashes utilizing a custom instance method `comparePassword()`. In future expansions, this block would yield a JWT for session longevity.

### Controllers & Business Logic
Routing is merged cleanly with embedded controller logic directly processing REST queries.
- **Listings Processing:** 
  - The `GET /api/listings` path extracts generic listing requests, augmenting filters if a `donorId` query parameter exists, sorting results temporally (`sort({ createdAt: -1 })`).
  - The `PUT /api/listings/:id` handles status/item modifications parsing standard CRUD instructions with `{ new: true, runValidators: true }` flags so invalid Types cannot bypass standard enforcement.

---

## 9. API DESIGN & INTEGRATION

The REST API implements predictable, resource-oriented endpoint nomenclature corresponding flawlessly with generic React Axios invocations.

### Core Endpoints

#### Authentication API
| Method | Endpoint | Description | Payload Format |
|--------|----------------------|-------------------------------|---------------------------|
| POST | `/api/auth/register` | Registers a new internal user | `{ fullName, email, password, role }` |
| POST | `/api/auth/login` | Validates credentials | `{ email, password }` |

#### Food Listing API
| Method | Endpoint | Description | Generic Response Format |
|--------|----------------------|--------------------------------|-------------------------|
| GET | `/api/listings` | Fetches listings (optional params) | `{ status: 'success', data: { listings: [] } }` |
| POST | `/api/listings` | Insert a new surplus asset | `{ status: 'success', data: { listing: {} } }` |
| PUT | `/api/listings/:id` | Modify parameters of asset | `{ status: 'success', data: { listing: {} } }` |
| DELETE | `/api/listings/:id` | Remove obsolete listing | `HTTP 204 No Content` |

#### Notification API
| Method | Endpoint | Description |
|--------|----------------------------------|------------------------------------|
| GET | `/api/notifications/:userId` | Get Alerts for a specific user ID |
| POST | `/api/notifications` | Create a new localized alert |
| DELETE | `/api/notifications/:id` | Dismiss a specific alert object |

### Integration Flow
When a Donor edits a listing via the frontend modal and submits, an `axios.put('http://localhost:5000/api/listings/{id}', formData)` is triggered. The Node router validates constraints, Mongoose updates the document, and transmits back status `200` with the updated JSON. React detects the state alteration `res.data.data.listing` and instantaneously mutations the `listings` array in state without a browser reload, reflecting UI changes instantly.

---

## 10. RESULTS & SCREENSHOTS

### Working Modules
- **Authentication Gateway:** Successfully routing users correctly corresponding with their profile `roles`.
- **Donor Operations:** Completely fluid experience adding custom Food items with Type mapping, Quantity definitions, Expiry timestamp allocation, and Real-Time tracking.
- **Polling Architecture:** Notifications render actively identifying transitions like (Pending => In Transit) utilizing asynchronous network pooling.
- **Data Persistence:** Complete validation preventing malicious operations (E.g. attempting to submit 'Negative 10' as food quantity immediately yields backend Mongoose Validation error propagation).

*(Placeholder for Physical Screenshots)*
- **Figure 10.1: Login/Register AuthPage:** Highlighting the clear segmentation between Donor, Volunteer, and NGO registration forms.
- **Figure 10.2: Donor Dashboard:** Demonstrating the Top Level metrics calculation components (Meals Saved, Pending Pickups) powered by dynamic reductions.
- **Figure 10.3: CRUD Listing Modal:** Visually depicting the Add/Edit form encompassing localized datetime inputs.
- **Figure 10.4: Error Validation Alerting:** Showcasing dynamic Bootstrap `Alert/Toast` responses reflecting backend failure outputs seamlessly on the UI overlay.

---

## 11. CONCLUSION

The implementation of the Surplus Food Management System perfectly manifests the synergy between modern technological toolchains (React & Node.js) and a real-world humanitarian requirement. The system dramatically truncates the communication latency endemic to classical food redistribution frameworks. 

### Achievements & Learnings
- **Full-Stack Competency:** Demonstrated the integration of NoSQL database storage communicating with a Stateful Client-Side UI rendered through RESTful interfaces.
- **State Management:** Overcame hurdles surrounding asynchronous data flows ensuring UI and DB parity during multiple network calls.
- **Scalable Component Building:** Established reusable, cohesive UI elements scaling aesthetically via pure CSS combined with the component framework of Bootstrap.
- **Security Protocols:** Established standard cryptographic methodologies (BCrypt salt-hash) to ensure data confidentiality.

---

## 12. FUTURE ENHANCEMENTS

While this Minimum Viable Product (MVP) covers the foundational necessities of food routing, future lifecycle iterations will implement profound upgrades:
- **Implementing JWT & OAuth2 Setup:** Migrating basic verification endpoints to secure JSON Web Token middlewares preventing API injection while allowing single-sign-on (SSO) with Google/Facebook.
- **Geospatial Route Mapping (ML/AI/Maps):** Integrating Google Maps API to orchestrate active routing. Allowing ML/AI prediction algorithms emphasizing optimized paths for Volunteers to execute Pickups preserving fossil fuel.
- **Predictive Analytics Modules:** Compiling long-term metadata to establish predictive charts projecting "High Food Surplus" hours corresponding with local restaurant workflows.
- **Mobile Application Deployment:** Adapting the React ecosystem to React Native explicitly for Volunteers requiring deep OS access (Live GPS Background Tracking, Push-Notifications).
- **Gamification/Reward System:** Injecting badges/reward points for hyper-active Volunteers or Donors establishing an intrinsic loop of continued platform engagement.

---

## 13. REFERENCES
1. React Documentation: https://react.dev/
2. Express JS Foundation: https://expressjs.com/
3. Mongoose Validation Guides: https://mongoosejs.com/docs/validation.html
4. React-Bootstrap Library Component API: https://react-bootstrap.netlify.app/
5. Food Waste and Loss Index (UNEP): Statistical baseline justifying the necessity of Surplus Management systems.
6. Axios HTTP Client Documentation: https://axios-http.com/docs/intro

---

## 14. APPENDIX / ANNEXURE (SOURCE CODE)

This section contains snippets signifying critical programmatic segments demonstrating systematic logic.

**Code Snippet: DonorDashboard State Hook Implementation (React)**
```jsx
// Real-time synchronization polling mechanism pulling Notifications and Listings
useEffect(() => {
  fetchListings(); 
  fetchNotifications();
  const interval = setInterval(() => {
    fetchListings();
    fetchNotifications();
  }, 3000); 
  return () => clearInterval(interval);
}, [user.id]);
```

**Code Snippet: Backend Listing Creation Validation (Node.js/Mongoose)**
```javascript
// Model: Enforcing Strict Bounds and Data Hygiene
const foodListingSchema = new mongoose.Schema({
  item: { type: String, required: [true, 'Please provide the food item name'], trim: true },
  quantity: { type: Number, required: [true, 'Please provide the quantity'], min: 1 },
  type: { type: String, enum: ['Cooked Meal', 'Groceries', 'Fruits', 'Bakery'], required: true },
  status: { type: String, enum: ['Pending', 'Assigned', 'In Transit', 'Picked Up', 'Rejected'], default: 'Pending' },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
```

**Code Snippet: Backend Password Security Layer (Node.js)**
```javascript
// Pre-save DB Middleware blocking pure-text passwords
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});
```

*GitHub Repository Link: [Insert GitHub URL Here]*

*End of Report Document.*
