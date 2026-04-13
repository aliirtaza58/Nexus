const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
  },
  uploadedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'pending_signature', 'signed'],
    default: 'draft',
  },
  version: {
    type: Number,
    default: 1,
  },
  signatureUrl: {
    type: String, // Mock storage url to the drawn signature
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Document', DocumentSchema);
