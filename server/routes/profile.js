const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @desc    Get Profile
// @route   GET /api/profile
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Return the currently logged in user profile
    const profile = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Update Profile
// @route   PUT /api/profile
// @access  Private
router.put('/', protect, async (req, res) => {
  try {
    const { name, bio, history, preferences } = req.body;
    
    // Build profile object fields
    const profileFields = {};
    if (name) profileFields.name = name;
    if (bio) profileFields.bio = bio;
    if (history) profileFields.history = history;
    if (preferences) profileFields.preferences = preferences;

    let profile = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
