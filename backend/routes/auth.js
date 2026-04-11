import express from 'express';
<<<<<<< HEAD
import { signup, login, getCurrentUser, logout } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
=======
import bcryptjs from 'bcryptjs';
import { createToken } from '../utils/jwt.js';
import { authMiddleware } from '../middleware/auth.js';
import { supabase } from '../server.js';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email);

    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user (name is stored as "FirstName LastName")
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash: hashedPassword,
        name: `${firstName} ${lastName}`
      }])
      .select()
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Create default subscription (free tier)
    await supabase
      .from('subscriptions')
      .insert([{ user_id: newUser.id, plan: 'free', status: 'active' }]);

    // Generate JWT token
    const token = createToken(newUser.id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const passwordMatch = await bcryptjs.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = createToken(user.id);

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, created_at')
      .eq('id', req.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', req.userId)
      .single();

    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', req.userId)
      .single();

    res.json({
      user: {
        id: user.id,
        email: user.email,
        profile,
        subscription,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, (req, res) => {
  // JWT logout is handled client-side by deleting token
  res.json({ message: 'Logged out successfully' });
});
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054

export default router;
