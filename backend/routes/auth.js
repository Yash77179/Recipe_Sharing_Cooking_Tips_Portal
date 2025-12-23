const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const { auth, JWT_SECRET } = require('../middleware/auth');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper function to normalize email addresses (especially for Gmail)
const normalizeEmail = (email) => {
  if (!email) return email;

  email = email.toLowerCase().trim();

  // For Gmail addresses, remove dots from the username part
  const emailParts = email.split('@');
  if (emailParts.length === 2) {
    const domain = emailParts[1];
    // Apply normalization for gmail.com and googlemail.com
    if (domain === 'gmail.com' || domain === 'googlemail.com') {
      const username = emailParts[0].replace(/\./g, '');
      return `${username}@${domain}`;
    }
  }

  return email;
};

// Configure Passport with Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:5001/api/auth/google/callback',
  userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
  proxy: true
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      const googleEmail = normalizeEmail(profile.emails[0].value);
      console.log('Google Profile:', JSON.stringify(profile, null, 2)); // Debug log

      // Check if user exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        // Only update photo from Google if user doesn't have a custom uploaded photo
        // Custom uploaded photos start with /uploads/, Google photos start with http
        if (profile.photos && profile.photos.length > 0) {
          if (!user.photo || user.photo.startsWith('http')) {
            // Only overwrite if no photo exists or if it's a Google photo
            user.photo = profile.photos[0].value;
          }
        }
        // Ensure passwordSet field exists (for existing users created before this feature)
        if (user.passwordSet === undefined || user.passwordSet === null) {
          // If user has a password, mark as set, otherwise mark as not set
          user.passwordSet = !!user.password;
        }
        // Set authProvider if not set
        if (!user.authProvider) {
          user.authProvider = 'google';
        }
        await user.save();
        return done(null, user);
      }

      // Check if user exists with the same email
      user = await User.findOne({ email: googleEmail });

      if (user) {
        // Link Google account to existing user
        user.googleId = profile.id;
        // Only update photo from Google if user doesn't have a custom uploaded photo
        if (profile.photos && profile.photos.length > 0) {
          if (!user.photo || user.photo.startsWith('http')) {
            user.photo = profile.photos[0].value;
          }
        }
        // For existing email users, check if they have password set
        if (user.passwordSet === undefined || user.passwordSet === null) {
          user.passwordSet = !!user.password;
        }
        if (!user.authProvider) {
          user.authProvider = user.password ? 'local' : 'google';
        }
        await user.save();
        return done(null, user);
      }

      // Create new user
      user = await User.create({
        name: profile.displayName,
        email: googleEmail,
        googleId: profile.id,
        photo: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
        passwordSet: false,
        authProvider: 'google',
        isVerified: true // Google users are already verified
      });

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Send OTP Route
router.post('/send-otp', [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail()
], async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // Check if verified user already exists
    const existingUser = await User.findOne({ email: normalizedEmail, isVerified: true });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find or create unverified user
    let user = await User.findOne({ email: normalizedEmail, isVerified: false });
    if (user) {
      user.name = name || user.name;
      if (password) user.password = password;
      user.otp = otp;
      user.otpExpires = otpExpires;
      user.markModified('password');
    } else {
      user = new User({
        name,
        email: normalizedEmail,
        password,
        otp,
        otpExpires,
        isVerified: false
      });
    }

    await user.save();

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: 'Email Verification OTP - Recipe Sharing Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Email Verification</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Thank you for signing up for the Recipe Sharing Portal. To complete your registration, please use the following One-Time Password (OTP):</p>
          <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #d35400;">${otp}</span>
          </div>
          <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #777; text-align: center;">&copy; 2024 Recipe Sharing Portal. Happy Cooking!</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Error sending OTP: ' + error.message });
  }
});

// Verify OTP Route
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({
      email: normalizedEmail,
      otp,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
});

// Signup Route (Kept for compatibility, but could be redirected to send-otp)
router.post('/signup', [
  // Validation rules
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/\d/).withMessage('Password must contain at least one number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }

    const { name, password } = req.body;
    const email = normalizeEmail(req.body.email);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message || 'Error creating user' });
  }
});

// Login Route
router.post('/login', [
  // Validation rules
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }

    const { password } = req.body;
    const email = normalizeEmail(req.body.email);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is verified
    if (user.authProvider === 'local' && !user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        favorites: user.favorites || [],
        photo: user.photo
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Get Current User Profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password').populate('favorites');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get recipes created by this user
    const recipes = await Recipe.find({ userId: req.userId }).sort({ createdAt: -1 });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        favorites: user.favorites || [],
        photo: user.photo,
        bannerImage: user.bannerImage
      },
      recipes,
      recipeCount: recipes.length
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Toggle Favorite Route
router.post('/favorites/:recipeId', auth, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const index = user.favorites.indexOf(recipeId);
    let isFavorited = false;

    if (index === -1) {
      // Add to favorites
      user.favorites.push(recipeId);
      isFavorited = true;
    } else {
      // Remove from favorites
      user.favorites.splice(index, 1);
      isFavorited = false;
    }

    await user.save();

    res.json({
      message: isFavorited ? 'Recipe added to favorites' : 'Recipe removed from favorites',
      isFavorited,
      favorites: user.favorites
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Error updating favorites' });
  }
});

// Verify Token Route (to check if user is still authenticated)
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      valid: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        favorites: user.favorites || [],
        photo: user.photo
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying token' });
  }
});

// Change Password Route (for users who already have a password)
router.post('/change-password', [
  auth,
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/\d/).withMessage('Password must contain at least one number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has a password
    if (!user.password) {
      return res.status(400).json({
        message: 'No password set. Use set password instead.'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Check if new password is different
    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: 'New password must be different from current password'
      });
    }

    // Update password
    user.password = newPassword;

    // Mark password as modified explicitly to ensure pre-save hook runs
    user.markModified('password');

    await user.save();

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// Check Password Status Route
router.get('/password-status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      hasPassword: !!user.password,
      hasGoogleAuth: !!user.googleId
    });
  } catch (error) {
    console.error('Password status error:', error);
    res.status(500).json({ message: 'Error checking password status' });
  }
});

// Set Password for Google OAuth Users
router.post('/set-password', [
  auth,
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    // Validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { password } = req.body;

    // Find user
    let user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('📝 Before password update:');
    console.log('  passwordSet:', user.passwordSet);
    console.log('  hasPassword:', !!user.password);

    // Check if password is already set
    if (user.passwordSet && user.password) {
      return res.status(400).json({ message: 'Password already set. Use change password instead.' });
    }

    // Hash the password manually before updating
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Use findByIdAndUpdate to ensure both fields are updated atomically
    user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          password: hashedPassword,
          passwordSet: true
        }
      },
      { new: true, runValidators: false }
    );

    console.log('✅ After update:');
    console.log('  passwordSet:', user.passwordSet);
    console.log('  hasPassword:', !!user.password);

    res.json({
      message: 'Password set successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        passwordSet: user.passwordSet,
        photo: user.photo
      }
    });
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({ message: 'Error setting password' });
  }
});

// Upload Profile Picture
router.post('/upload-profile-picture', auth, (req, res) => {
  upload.single('profileImage')(req, res, async (err) => {
    try {
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size is too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ message: 'File upload error: ' + err.message });
      } else if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ message: err.message || 'File upload failed' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Delete old profile picture if it exists and is not a Google photo
      if (user.photo && !user.photo.startsWith('http')) {
        const oldPhotoPath = path.join(__dirname, '../', user.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      // Save new photo path
      const photoUrl = `/uploads/profiles/${req.file.filename}`;
      user.photo = photoUrl;
      await user.save();

      res.json({
        message: 'Profile picture uploaded successfully',
        photoUrl: photoUrl
      });
    } catch (error) {
      console.error('Upload profile picture error:', error);
      res.status(500).json({ message: 'Error uploading profile picture: ' + error.message });
    }
  });
});

// Upload Banner Image
router.post('/upload-banner', auth, (req, res) => {
  console.log('Banner upload request received from user:', req.userId);
  upload.single('bannerImage')(req, res, async (err) => {
    try {
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size is too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ message: 'File upload error: ' + err.message });
      } else if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ message: err.message || 'File upload failed' });
      }

      if (!req.file) {
        console.log('No file in request');
        return res.status(400).json({ message: 'No file uploaded' });
      }

      console.log('File received:', req.file.filename);

      const user = await User.findById(req.userId);
      if (!user) {
        console.log('User not found:', req.userId);
        return res.status(404).json({ message: 'User not found' });
      }

      // Delete old banner if it exists
      if (user.bannerImage) {
        const oldBannerPath = path.join(__dirname, '../', user.bannerImage);
        if (fs.existsSync(oldBannerPath)) {
          fs.unlinkSync(oldBannerPath);
          console.log('Deleted old banner:', oldBannerPath);
        }
      }

      // Save new banner path
      const bannerUrl = `/uploads/profiles/${req.file.filename}`;
      user.bannerImage = bannerUrl;
      await user.save();

      console.log('Banner uploaded successfully:', bannerUrl);

      res.json({
        message: 'Banner image uploaded successfully',
        bannerUrl: bannerUrl
      });
    } catch (error) {
      console.error('Upload banner error:', error);
      res.status(500).json({ message: 'Error uploading banner image: ' + error.message });
    }
  });
});

// Google OAuth Routes
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:5173/login',
    session: false
  }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { userId: req.user._id, email: req.user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Determine redirect based on password status
    const redirectTo = !req.user.passwordSet ? '/set-password' : '/';

    // Dynamic frontend URL construction
    const host = req.get('host'); // e.g., 192.168.1.5:5001 or localhost:5001
    const frontendHost = host.replace('5001', '5173'); // Assume frontend is on 5173
    const frontendBaseUrl = `http://${frontendHost}`;

    // Debug logging
    console.log('🔐 Google OAuth Callback Debug:');
    console.log('User:', req.user.email);
    console.log('passwordSet:', req.user.passwordSet);
    console.log('redirectTo:', redirectTo);
    console.log('Redirecting to frontend:', frontendBaseUrl);

    // Redirect to frontend with token and redirectTo
    res.redirect(`${frontendBaseUrl}/auth/callback?token=${token}&redirectTo=${redirectTo}&user=${encodeURIComponent(JSON.stringify({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      photo: req.user.photo,
      passwordSet: req.user.passwordSet
    }))}`);
  }
);

module.exports = router;
