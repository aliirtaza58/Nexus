const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

// Route files
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const meetingRoutes = require('./routes/meetings');
const documentRoutes = require('./routes/documents');
const paymentRoutes = require('./routes/payments');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // Vercel frontend URL will be added later
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payments', paymentRoutes);
// Serve uploaded files statically for preview
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Root route
app.get('/', (req, res) => {
  res.send('Nexus API is running...');
});

// WebRTC Signaling
io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
