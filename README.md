# SymbiEat - College Food Ordering System

A modern web application for SIT Pune students to order and reserve food from their college canteen.

## Features

- 🔐 User Authentication (Login/Signup)
- 🍔 Real-time Food Menu
- ⏲️ Food Reservation System
- 👤 User Profile Management
- 📱 Responsive Design
- 📊 Order History Tracking
- ⏳ 30-minute Reservation Timer
- 🔔 Low Time Alerts

## Tech Stack

### Frontend
- HTML5
- CSS3 (Custom CSS with Variables)
- JavaScript (ES6+)
- Font Awesome Icons
- Responsive Design
- CSS Animations
- Local Storage for State Management

### Backend
- Node.js
- Express.js
- MongoDB (Database)
- Mongoose (ODM)
- Passport Authentication
- RESTful API Architecture

## Project Structure

```
SYMBI-EAT/                       # Root folder of the project
├── models/                      # Contains database models for different entities
│   ├── inventory.js             # Model for inventory-related operations
│   ├── orders.js                # Model for handling orders data
│   ├── reservations.js          # Model for managing reservations
│   └── users.js                 # Model for user-related operations
├── node_modules/                # Node.js dependencies (auto-generated)
├── public/                      # Static files served to the client
│   ├── images/                  # Contains images used in the project
│   │   ├── default-avatar.svg   # Default avatar image for users
│   │   └── food.jpg             # Sample image of food
│   └── styles/                  # CSS stylesheets for the application
│       ├── login.css            # Styles for the login page
│       ├── profile.css          # Styles for the profile page
│       └── style.css            # Global styles for the application
├── views/                       # EJS templates for rendering pages
│   ├── home.ejs                 # Template for the homepage
│   ├── login.ejs                # Template for the login page
│   ├── profile.ejs              # Template for the profile page
│   └── signup.ejs               # Template for the signup page
├── .gitignore                   # Lists files and folders to ignore in Git
├── index.js                     # Main entry point for the application
├── LICENSE                      # License file for the project
├── package-lock.json            # Auto-generated file for locking dependencies
├── package.json                 # Metadata and dependencies for the project
└── README.md                    # Documentation for the project
```

## Features in Detail

### Authentication System
- Email & Password based authentication
- Secure password hashing
- Passport based sessions

### Food Ordering System
- Real-time menu updates
- Food item availability tracking
- Price and quantity management
- Image preview for all items

### Reservation System
- 30-minute reservation timer
- Auto-cancellation after timeout
- Accept/Cancel reservation options
- Real-time status updates

### User Profile
- Order history tracking
- Current reservations management
- Student ID integration
- Profile customization

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/sayantann7/symbieat.git
   ```

2. Install dependencies:
   ```bash
   npm i
   ```

3. Start the development server:
   ```bash
   npx nodemon index.js
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**Sayantan Nandi**  
First Year CSE Student