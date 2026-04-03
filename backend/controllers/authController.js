import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../utils/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_production';
const JWT_EXPIRY = '7d';

/**
 * Signup - Create new user account
 * POST /api/auth/signup
 * Body: { email, password, name, age }
 */
export const signup = async (req, res) => {
  try {
    const { email, password, name, age } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user in database
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password_hash: passwordHash,
          name,
          age: age || null,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        return res.status(409).json({ error: 'Email already exists' });
      }
      throw error;
    }

    // Create JWT token
    const token = jwt.sign({ userId: data.id, email: data.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });

    res.status(201).json({
      message: 'Signup successful',
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        age: data.age,
      },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
};

/**
 * Login - Authenticate user and return JWT
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
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

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        age: user.age,
        verified: user.verified,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * Get current user (requires auth)
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId; // Set by authenticate middleware

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, age, verified, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

/**
 * Logout - Invalidate token (client-side, JWT is stateless)
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  // Since JWT is stateless, logout is handled client-side by removing the token
  res.json({ message: 'Logout successful' });
};
