const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs if needed

const dataFilePath = path.join(__dirname, 'data.json');

// Predefined dummy users
const dummyUsers = [
    { user_id: '1001', password: 'password1', isAdmin: false },
    { user_id: '1002', password: 'password2', isAdmin: false },
    { user_id: '1003', password: 'password3', isAdmin: false },
    { user_id: '1004', password: 'password4', isAdmin: false },
    { user_id: '1005', password: 'password5', isAdmin: false },
    { user_id: '1006', password: 'password6', isAdmin: true } // Admin user
];

// Create initial data
const initialData = {
    users: dummyUsers,
    bookings: []
};

// Write to data.json
fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2));
console.log('Data seeded successfully');
