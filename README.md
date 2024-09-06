# FindNest-Spring : Advanced Lost and Found Management System

## Overview
FindNest is an innovative digital solution designed to streamline and enhance the lost and found process at CIT-University. This system automates manual procedures, making it easier for students, faculty, and staff to report and claim lost items efficiently. With a focus on user-friendliness and security, FindNest offers a comprehensive platform that integrates the reporting, tracking, and management of lost and found items.

## Features
- **Report Found Items**: Users can report found items through an intuitive form, detailing item name, description, location found, and date found.
- **Staff Dashboard**: A dashboard for staff members to manage reported items, with capabilities to sort and filter through the lost items.
- **Search Functionality**: Enables staff members to search for specific items based on item name, location found, and date found.
- **Claim Verification**: Allows staff to verify claims through a manual process, ensuring the rightful owner retrieves their item.
- **History Tracking**: Maintains a record of reported, claimed, and unclaimed items for administrative purposes.
- **Admin Account Management**: Admins can manage staff accounts, creating and editing access as needed.
- **Privacy and Security**: Implements role-based access control and adheres to strict privacy requirements to protect user information.

## Technical Stack

- **Frontend**: React, set up with Vite - for a faster development and build process, building a dynamic and interactive user interface.
- **Backend**: Spring Boot - for handling server-side logic, API endpoints, and integration with the Firebase database.
- **Database**: Firebase - for storing and managing application data efficiently.
- **Authentication**: Implements secure login mechanisms for staff and admin roles.

![React](https://img.shields.io/badge/-React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/-Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Spring Boot](https://img.shields.io/badge/-Spring%20Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Firebase](https://img.shields.io/badge/-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)

## Getting Started

### Prerequisites
- Node.js
- Java (for Spring Boot)
- Firebase Account

### Installation
git clone https://github.com/yourrepository/findnest.git
cd findnest-firebase
npm install

### Running the Application
# Start the Spring Boot backend server
./mvnw spring-boot:run

# Start the React frontend with Vite
cd client
npm install
npm run dev
