const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const dataFilePath = path.join(__dirname, 'data.json');

const readData = () => JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
const writeData = (data) => fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

// Function to clean up expired bookings
const cleanUpExpiredBookings = () => {
  const data = readData();
  const now = new Date();
  
  // Filter out bookings where the end time is before the current time
  data.bookings = data.bookings.filter(booking => {
    const endTime = new Date(`${booking.date}T${booking.endTime}`);
    return endTime > now;
  });

  writeData(data);
};

// Call cleanup function every minute
setInterval(cleanUpExpiredBookings, 60 * 1000); // 60,000 milliseconds = 1 minute

app.post('/api/signup', (req, res) => {
  // Prevent new user sign-ups
  res.status(403).json({ message: 'Sign up is disabled.' });
});

app.post('/api/login', (req, res) => {
  const { user_id, password } = req.body;
  const data = readData();
  
  // Check if user exists and password matches
  const user = data.users.find(user => 
    user.user_id === user_id && password === user.password
  );
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  res.json({ message: 'Login successful', isAdmin: user.isAdmin, user_id, name: user.name });
});

app.post('/api/change-password', (req, res) => {
  const { user_id, oldPassword, newPassword } = req.body;
  const data = readData();
  
  // Validate old password
  const user = data.users.find(user => 
    user.user_id === user_id && oldPassword === user.password
  );

  if (!user) {
    return res.status(401).json({ message: 'Old password is incorrect' });
  }

  // Update password
  user.password = newPassword;
  writeData(data);
  res.json({ message: 'Password updated successfully' });
});

app.post('/api/delete-account', (req, res) => {
  const { user_id, password } = req.body;
  const data = readData();
  
  // Validate password
  const user = data.users.find(user => 
    user.user_id === user_id && password === user.password
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Check if the user is admin
  if (user.isAdmin) {
    return res.status(403).json({ message: 'Admin cannot delete their own account' });
  }

  // Remove the user from the data
  data.users = data.users.filter(user => user.user_id !== user_id);
  writeData(data);
  res.json({ message: 'Account deleted successfully' });
});

app.get('/api/users', (req, res) => {
  const data = readData(); // Read data from file
  res.json(data.users);    // Return the list of users as JSON
});
app.post('/api/users', (req, res) => {
  const { user_id, password, name } = req.body;
  const data = readData();
  
  if (!user_id || !password || !name) {
    return res.status(400).json({ message: 'User ID, password, and name are required' });
  }

  const newUser = { user_id, password, isAdmin: false, name };
  data.users.push(newUser);
  writeData(data);
  res.status(201).json({ message: 'User added successfully' });
});

// Endpoint to delete a user
app.delete('/api/users/:user_id', (req, res) => {
  const { user_id } = req.params;
  const data = readData();
  
  const userIndex = data.users.findIndex(user => user.user_id === user_id);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  data.users.splice(userIndex, 1);
  writeData(data);
  res.json({ message: 'User deleted successfully' });
});



app.post('/api/bookings', (req, res) => {
  const { day, date, startTime, endTime, user_id } = req.body;
  const data = readData();

  if (!day || !date || !startTime || !endTime || !user_id) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const slotConflict = data.bookings.some(
    booking => booking.date === date && booking.startTime === startTime && booking.endTime === endTime && booking.day === day
  );

  if (slotConflict) {
    return res.status(400).json({ message: 'Slot already booked' });
  }

  const newBooking = { id: uuidv4(), day, date, startTime, endTime, user_id };
  data.bookings.push(newBooking);
  writeData(data);
  res.status(201).json({ message: 'Booking created' });
});

app.get('/api/bookings', (req, res) => {
  const data = readData();
  res.json(data.bookings);
});

app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const user_id = req.query.user_id; // Expect user_id to be passed as a query parameter
  const data = readData();
  const initialLength = data.bookings.length;

  data.bookings = data.bookings.filter(b => b.id !== id || b.user_id !== user_id);

  if (data.bookings.length === initialLength) {
    return res.status(404).json({ message: 'Booking not found or not authorized' });
  }

  writeData(data);
  res.json({ message: 'Booking deleted' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
