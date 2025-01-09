const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let locations = [];

// Serve static files from the "public" directory
app.use(express.static('public'));

// WebSocket connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle location sent by `pageOne`
  socket.on('sendLocation', (location) => {
    const index = locations.findIndex((l) => l.id === socket.id);
    if (index > -1) {
      // Update existing user's location
      locations[index] = { id: socket.id, ...location };
    } else {
      // Add new user's location
      locations.push({ id: socket.id, ...location });
    }

    // Broadcast updated locations to all `pageTwo` clients
    io.emit(
      'broadcastLocations',
      locations.map(({ id, username, latitude, longitude }) => ({
        id,
        username,
        latitude,
        longitude,
      }))
    );
    console.log(`Updated locations: ${JSON.stringify(locations, null, 2)}`);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    // Remove disconnected user's location
    locations = locations.filter((l) => l.id !== socket.id);

    // Broadcast updated locations
    io.emit(
      'broadcastLocations',
      locations.map(({ id, username, latitude, longitude }) => ({
        id,
        username,
        latitude,
        longitude,
      }))
    );
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
