const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  host: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  attendee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a meeting title'],
  },
  description: {
    type: String,
  },
  startTime: {
    type: Date,
    required: [true, 'Please add a start time'],
  },
  endTime: {
    type: Date,
    required: [true, 'Please add an end time'],
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending',
  },
  meetingLink: {
    type: String, // E.g. for video call room ID
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Meeting', MeetingSchema);
