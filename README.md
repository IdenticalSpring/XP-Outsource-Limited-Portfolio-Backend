# NestJS API Documentation

## Overview
This project is a NestJS application designed to manage various entities including Statistics, Banners, Blogs, Contacts, Members, and Admins. It utilizes TypeORM for database interactions and implements JWT authentication for secure access to certain routes.

## Features
- **Statistics Management**: Create, read, update, and delete statistics.
- **Banner Management**: Create, read, update, and delete banners.
- **Blog Management**: Create, read, update, and delete blog posts.
- **Contact Management**: Create, read, update, and delete contact information.
- **Member Management**: Create, read, update, and delete member information.
- **Admin Management**: Register and log in admins with secure password handling.

## Technologies Used
- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **TypeORM**: An ORM for TypeScript and JavaScript that supports various databases.
- **MySql**: The database used for storing application data.
- **JWT**: JSON Web Tokens for secure authentication.

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd nestjs-api
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root directory and configure your database settings:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=your_password
   DB_NAME=nestjs_db
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_here
   ```
5. Run the application:
   ```
   npm run start:dev
   ```

## API Documentation
The API is documented using Swagger. You can access the documentation at `http://localhost:3000/api`.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.