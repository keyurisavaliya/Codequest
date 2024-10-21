Code Quest - Knowledge Base Application
Project Overview
Code Quest is a web application designed to help users search for and retrieve information on various topics by fetching relevant questions and answers from popular Q&A platforms such as Stack Overflow and Reddit. The platform provides users with search functionality, result display, filtering and sorting options, email generation for follow-up, and optional translation features.

Features
Search Functionality: Users can search for questions on different topics, fetching relevant information from external Q&A platforms like Stack Overflow and Reddit.
Result Display: Displays search results in an easy-to-read format, including questions, answers, and additional details.
Filtering and Sorting: Users can filter and sort search results based on different criteria (e.g., relevance, date).
Email Generation: Users can generate emails based on a selected question and its response.
Data Caching: Implements caching to store search results temporarily for better performance and quick access.
Data Access Without Login: Users can access search functionality without needing to log in.
Technologies Used
Frontend: React.js, Axios
Backend: Node.js, Express.js
Database: MongoDB
Email Sending: Nodemailer with OAuth2 authentication
External APIs: Stack Overflow, Reddit API
How to Run the Project
Prerequisites
Make sure you have the following installed on your machine:

Node.js (version 14 or higher)
MongoDB (running locally or remotely)
Git
For backend:    cd backend 
                         node server.js
For frontend:   cd frontend
                         npm i
                         npm run dev

Using the Application
Search: Use the search bar to input your query and get results from platforms like Stack Overflow and Reddit.
Filtering and Sorting: Apply filters to narrow down search results or sort them based on relevance or date.
Email Generation: Select a question/answer to generate an email for further follow-up.
