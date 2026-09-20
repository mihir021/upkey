const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { activeUsersGauge } = require('../metrics/prometheus');

const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

/** Safely extract the public user object to send to the frontend. */
function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    onboardingCompleted: Boolean(user.onboardingCompleted),
  };
}

async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, passwordHash });

    const token = signToken(user);
    
    // Track active user count
    activeUsersGauge.inc();

    res.status(201).json({
      token,
      user: publicUser(user),
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Something went wrong during signup.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Same message for "no user" and "wrong password" on purpose -
      // don't reveal which one it was, so attackers can't tell if an email is registered.
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user);
    
    // Track active user count
    activeUsersGauge.inc();

    res.status(200).json({
      token,
      user: publicUser(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Something went wrong during login.' });
  }
}

/**
 * GET /api/auth/me
 * Returns the authenticated user's full profile including preferences.
 */
async function getMe(req, res) {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ message: 'Something went wrong.' });
  }
}

module.exports = { signup, login, getMe };

