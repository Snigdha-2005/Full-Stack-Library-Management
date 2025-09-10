# Full-Stack Library Management System

A full-stack library management system is a robust and efficient web application for handling the core operations of a library. Developed using **HTML**, **CSS**, **JavaScript**, and libraries like **Express** and **Tailwind**, this system is a powerful, monolithic application where both the front-end and back-end are built using JavaScript.

---
### Here are the snapshots of some of the pages we have included in the application.

<img width="1920" height="1080" alt="2025-09-11 (5)" src="https://github.com/user-attachments/assets/380df5b7-bad4-4122-a391-654f3a0b00ef" />
<img width="1920" height="1080" alt="2025-09-11 (6)" src="https://github.com/user-attachments/assets/e15a5dda-d137-4689-b456-47c9a72f97c8" />
<img width="1920" height="1080" alt="2025-09-11 (1)" src="https://github.com/user-attachments/assets/a4ae59ac-0687-4933-9a07-a7298c99df86" />
<img width="1920" height="1080" alt="2025-09-11 (2)" src="https://github.com/user-attachments/assets/6a3687aa-bc5b-4119-b523-e3c2ab40b079" />
<img width="1920" height="1080" alt="2025-09-11 (3)" src="https://github.com/user-attachments/assets/ee93755e-4c44-40f8-a73c-7858912d431f" />
<img width="1920" height="1080" alt="2025-09-11 (4)" src="https://github.com/user-attachments/assets/6ca78d3f-ef8a-490b-bc0f-3457040297fe" />

### Key Components

The system is divided into two main parts:

* **Front-End:** This is what the user interacts with. It is built with:
    * **HTML**: Provides the core structure and layout.
    * **CSS**: Styles the application. **Tailwind CSS** is used here, offering a utility-first approach. Developers apply predefined classes directly in the HTML (e.g., `flex`, `bg-blue-500`) for rapid and highly customizable UI development.
    * **JavaScript**: Handles all interactive elements and makes calls to the back-end API.

* **Back-End:** This is the server-side logic that manages data and business rules. It is powered by **Node.js** with the **Express.js** framework and **MongoDB**:
    * **Express.js**: A flexible and minimalist web application framework that simplifies the creation of RESTful APIs. It handles crucial tasks like routing, authentication, and database interactions.
    * **MongoDB**: A **NoSQL** database used to store all the application's data, including information on books, users, and circulation history. Express connects to MongoDB to perform all data-related operations.

---

### Core Features

A typical full-stack library management system would include several key modules:

* **Book Management**: Offers **CRUD** (Create, Read, Update, Delete) functionality to manage a database of books, including details like title, author, genre, and availability. It also provides search and filter options for users.
* **User Management**: Includes features for user authentication (login and registration) and authorization (e.g., distinguishing between a librarian and a regular user). It also allows for user profiles to track borrowed books and history.
* **Circulation Management**: Handles the core library operations of borrowing and returning books. It tracks due dates and calculates overdue fines.
* **Responsive UI**: Thanks to **Tailwind CSS**, the application's interface is fully responsive, ensuring it looks good and is functional on various devices, from desktops to mobile phones.
