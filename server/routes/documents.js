const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const Document = require('../models/Document');

const router = express.Router();

// Setup Multer Storage (Local mock instead of AWS S3 for demo)
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// @desc    Upload document
// @route   POST /api/documents
// @access  Private
router.post('/', protect, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    const doc = await Document.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      uploadedBy: req.user.id,
      status: 'pending_signature',
    });

    res.status(201).json({
      success: true,
      data: doc,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: 'File upload failed' });
  }
});

// @desc    Get all documents for a user
// @route   GET /api/documents
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Both uploaded by user, or all documents (mock access)
    const docs = await Document.find({ uploadedBy: req.user.id });
    res.status(200).json({
      success: true,
      count: docs.length,
      data: docs,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Attach e-signature to document
// @route   PUT /api/documents/:id/sign
// @access  Private
router.put('/:id/sign', protect, async (req, res) => {
  try {
    const { signatureUrl } = req.body;
    let doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    doc.signatureUrl = signatureUrl;
    doc.status = 'signed';
    await doc.save();

    res.status(200).json({
      success: true,
      data: doc,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
