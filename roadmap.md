# Context & Core Mission
You are an expert full-stack developer acting as an AI coding agent. We are building the official Training and Placement Committee (TPC) website for the Indian Institute of Technology (IIT) Patna. 

**Mission:** The platform exists to seamlessly connect three user groups—Students, Companies, and TPC Admins. It aims to make the recruitment process highly efficient for companies (allowing them to filter and recruit top talent easily) and smoother for students (providing a centralized hub for events, internships, and placement drives).

# Tech Stack
* Frontend: React.js, TailwindCSS, Recharts/Chart.js for graphs, React Big Calendar (or similar) for the events calendar.
* Backend: Node.js, Express.js.
* Database: MongoDB (Mongoose for ODM).
* Authentication: Passwordless OTP verification via Email, JWT for session management.

# Design & Tone
Formal, professional, clean, and highly functional. It represents a premier engineering institute.

# Task Execution Plan
Please execute the following phases one by one. Ask for my permission before moving to the next phase.

## Phase 1: Database Models & Architecture
Create Mongoose models optimized for complex querying and role-based access.
1.  **User Base Model:** `email`, `role` (enum: 'admin', 'company', 'student'), `profilePicture`.
2.  **Student Schema (Crucial for Filtering):** Extends User. Needs: `name`, `rollNumber`, `batch` (e.g., 2026), `program` (B.Tech, M.Tech, M.Sc), `branch` (CSE, EE, ME, etc.), `cgpa` (Number), `skills` (Array of Strings), `resumeLink`.
3.  **Company Schema:** Extends User. Needs: `companyName`, `industry`, `verificationStatus` (enum: 'pending', 'verified', 'rejected'). Implement a MongoDB TTL index (48 working hours) on a `createdAt` field that only applies if status is 'pending', automatically purging unverified dummy accounts.
4.  **Admin Schema:** Extends User. Needs: `adminType` (enum: 'super_admin', 'announcement_admin', 'student_admin').
5.  **Event/Opportunity Schema:** Needs: `title`, `description`, `date`, `type` (enum: 'internship', 'placement_drive', 'workshop'), `targetBranches` (Array), `deadline`.
6.  **OTP Model:** `email`, `otp`, `createdAt` (TTL index of 10 minutes).

## Phase 2: Passwordless OTP Authentication
1.  **Generate OTP (`/api/auth/request-otp`):** Accepts email and role. Generates 6-digit OTP, saves to DB, stubs email dispatch via console.log. *Constraint: New companies start with 'pending' status.*
2.  **Verify OTP (`/api/auth/verify-otp`):** Validates OTP, issues JWT containing `userId`, `role`, and `adminType`/`verificationStatus`.
3.  **Middleware:** `verifyToken`, `requireRole(roles[])`, `isCompanyVerified` (blocks 'pending' companies from sensitive routes).

## Phase 3: Public Landing Page (Frontend)
1.  **Navbar:** TPC logo, Home, Contact Us, Login, Sign Up.
2.  **Hero Section:** IIT Patna background image, dark overlay, formal typography with TPC name and institute motto.
3.  **Statistics Section:** Dummy JSON data powering:
    * Histogram/Bar graph comparing placement % for B.Tech, M.Tech, M.Sc.
    * Visual cards/charts for Average, Median, and Highest packages.
4.  **Footer:** Clean, formal, copyright, and institute links.

## Phase 4: Dynamic Dashboard & Routing Shell
1.  **Auth UI:** Email input -> Role selection (Dropdown) -> OTP Input -> Submit.
2.  **Dashboard Shell:** Main Navbar (top) + Dynamic Sidebar (left).
3.  **Sidebar UI:** Large Profile Image with "Edit Profile" pencil icon. Dynamic links based on JWT role.
    * *Student Sidebar:* Announcements, Calendar / Opportunities.
    * *Company Sidebar:* Student Database, Verification Status. (If 'pending', disable 'Student Database' with a lock icon).
    * *Admin Sidebar:* Announcements, Verify Companies, Manage Users, Assign Power.

## Phase 5: Core Business Logic & Role-Specific Features
1.  **Company Feature - Student Database:** * Build an advanced table view for verified companies.
    * Include a robust filtering UI: Range slider for CGPA (e.g., > 8.0), Multi-select dropdowns for `branch` and `program`. 
    * Backend API must construct a dynamic MongoDB query (using `$gte`, `$in`) based on these filters.
2.  **Student Feature - Calendar & Opportunities:**
    * Integrate a calendar library. Fetch and display upcoming 'Events' and 'Internships'.
    * Create an "Announcements" feed specifically targeted to the student's branch/batch.
3.  **Admin RBAC Features:**
    * *Verify Company:* UI to list 'pending' companies and approve/reject them.
    * *Assign Power:* * `super_admin`: Full CRUD. Can create any admin.
        * `announcement_admin`: Can only CRUD Announcements/Events. Can only create other `announcement_admin`s.
        * `student_admin`: Can manage Student resources, add Announcements. Can only create other `student_admin`s.