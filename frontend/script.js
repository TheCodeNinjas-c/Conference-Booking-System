const API_URL = 'http://localhost:5000/api';
document.addEventListener('DOMContentLoaded', () => {
    // Check if the user is logged in when the page loads
    const user_id = localStorage.getItem('user_id');
    if (user_id) {
        // User is logged in
        document.getElementById('auth').style.display = 'none';
        document.getElementById('booking').style.display = 'block';
        document.getElementById('manageAccountButton').style.display = 'block';
        document.getElementById('greeting').innerText = `Good day ${localStorage.getItem('user_name')}!`;
        fetchBookings(); // Fetch and display bookings
    } else {
        // User is not logged in
        document.getElementById('auth').style.display = 'block';
        document.getElementById('booking').style.display = 'none';
        document.getElementById('manageAccountButton').style.display = 'none';
        document.getElementById('greeting').innerText = '';
    }
});

const login = async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: username, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('user_id', username);
            localStorage.setItem('user_name', data.name);
            document.getElementById('auth').style.display = 'none';
            document.getElementById('booking').style.display = 'block';
            document.getElementById('greeting').innerText = `Good day ${data.name}!`;
            document.getElementById('manageAccountButton').style.display = 'block';
            fetchBookings();
            alert('Login successful!');
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error logging in:', error);
    }
};


const signup = async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Username and password cannot be empty.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: username, password })
        });
        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Error signing up:', error);
    }
};

const manageAccount = () => {
    document.getElementById('manageAccount').style.display = 'block';
    document.getElementById('booking').style.display = 'none';

    const user_id = localStorage.getItem('user_id');
    const isAdmin = user_id === 'admin'; // Simple check for admin

    document.getElementById('manageAccount').innerHTML = isAdmin ?
        `
        <h2>Manage Users</h2>
        <button onclick="listUsers()">List Users</button>
        <button onclick="logout()">Logout</button>
        ` :
        `
        <h2>Manage Your Account</h2>
        <button onclick="changePassword()">Change Password</button>
        <button onclick="deleteAccount()">Delete Account</button>
        <button onclick="logout()">Logout</button>
        `;
};

const changePassword = async () => {
    const user_id = localStorage.getItem('user_id');
    const oldPassword = prompt('Enter your old password:');
    const newPassword = prompt('Enter your new password:');

    if (!oldPassword || !newPassword) {
        alert('Both old and new passwords are required.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, oldPassword, newPassword })
        });
        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Error changing password:', error);
    }
};

const deleteAccount = async () => {
    const user_id = localStorage.getItem('user_id');
    const password = prompt('Enter your password to confirm deletion:');

    if (!password) {
        alert('Password is required.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/delete-account`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, password })
        });
        const data = await response.json();
        alert(data.message);
        if (response.ok) {
            logout(); // Log out after deletion
        }
    } catch (error) {
        console.error('Error deleting account:', error);
    }
};

const bookSlot = async () => {
    const day = document.getElementById('day').value;
    const date = document.getElementById('date').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const user_id = localStorage.getItem('user_id');

    try {
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ day, date, startTime, endTime, user_id })
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            fetchBookings();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error booking slot:', error);
    }
};

const fetchBookings = async () => {
    try {
        const response = await fetch(`${API_URL}/bookings`);
        const bookings = await response.json();
        const tbody = document.querySelector('#bookingTable tbody');
        tbody.innerHTML = ''; // Clear existing rows

        const user_id = localStorage.getItem('user_id');
        bookings.forEach(booking => {
            const { id, day, date, startTime, endTime, user_id: creatorId } = booking;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${day}</td>
                <td>${date}</td>
                <td>${startTime}</td>
                <td>${endTime}</td>
                <td>${creatorId}</td>
                <td>
                    ${creatorId === user_id || user_id === 'admin' ? `<button onclick="deleteBooking('${id}')">Delete</button>` : ''}
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
    }
};

const deleteBooking = async (id) => {
    const user_id = localStorage.getItem('user_id');

    try {
        const response = await fetch(`${API_URL}/bookings/${id}?user_id=${user_id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            fetchBookings();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
    }
};

const logout = () => {
    localStorage.removeItem('user_id');
    document.getElementById('auth').style.display = 'block';
    document.getElementById('booking').style.display = 'none';
    document.getElementById('manageAccount').style.display = 'none';
    document.getElementById('manageAccountButton').style.display = 'none';
    document.getElementById('greeting').innerText = ''; // Clear greeting message
};

const listUsers = async () => {
    try {
        const response = await fetch(`${API_URL}/users`);
        const users = await response.json();
        let usersHtml = '<h3>Users List</h3><ul>';
        usersHtml += '</ul>';
        document.getElementById('manageAccount').innerHTML = usersHtml;
        // Redirect to list.html
        window.location.href = 'list.html';
    } catch (error) {
        console.error('Error listing users:', error);
    }
};


