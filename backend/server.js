import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

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

// TODO: Import and use route handlers
// import authRoutes from './routes/auth.js';
// import profileRoutes from './routes/profiles.js';
// import matchRoutes from './routes/matches.js';
// import messageRoutes from './routes/messages.js';
// import paymentRoutes from './routes/payments.js';

// Routes (to be implemented)
// app.use('/api/auth', authRoutes);
// app.use('/api/profiles', profileRoutes);
// app.use('/api/matches', matchRoutes);
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
