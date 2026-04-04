import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profiles.js';
import discoverRoutes from './routes/discover.js';
import messageRoutes from './routes/messages.js';
import photoRoutes from './routes/photos.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/profiles', photoRoutes);
// app.use('/api/messages', messageRoutes);
// app.use('/api/payments', paymentRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Next-Chapter API running on http://localhost:${PORT}`);
});
