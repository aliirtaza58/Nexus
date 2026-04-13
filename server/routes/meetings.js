const express = require('express');
const { protect } = require('../middleware/auth');
const Meeting = require('../models/Meeting');

const router = express.Router();

// @desc    Get logged in user's meetings
// @route   GET /api/meetings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ host: req.user.id }, { attendee: req.user.id }]
    })
      .populate('host', 'name email role')
      .populate('attendee', 'name email role')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: meetings.length,
      data: meetings,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Schedule a meeting
// @route   POST /api/meetings
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { attendeeId, title, description, startTime, endTime } = req.body;

    // Convert strings to Date objects
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Conflict Detection
    const conflict = await Meeting.findOne({
      status: { $in: ['accepted', 'pending'] },
      $or: [
        { host: req.user.id }, { attendee: req.user.id },
        { host: attendeeId }, { attendee: attendeeId }
      ],
      $and: [
        { startTime: { $lt: end } },
        { endTime: { $gt: start } }
      ]
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        error: 'Time slot conflict detected. Please choose another time.'
      });
    }

    // Generate pseudo-random meeting link (e.g., roomID for video call)
    const meetingLink = `room_${Math.random().toString(36).substring(2, 9)}`;

    const meeting = await Meeting.create({
      host: req.user.id,
      attendee: attendeeId,
      title,
      description,
      startTime: start,
      endTime: end,
      meetingLink,
    });

    res.status(201).json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Update meeting status
// @route   PUT /api/meetings/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    // Make sure user is part of the meeting
    if (meeting.host.toString() !== req.user.id && meeting.attendee.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this meeting' });
    }

    meeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
