const express = require('express');
const { protect } = require('../middleware/auth');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Mock dependencies (In real world, require stripe here)

// @desc    Get all transactions for logged in user
// @route   GET /api/payments/transactions
// @access  Private
router.get('/transactions', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ user: req.user.id }, { recipientId: req.user.id }]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Mock setup deposit intent (Stripe sandbox abstract)
// @route   POST /api/payments/deposit
// @access  Private
router.post('/deposit', protect, async (req, res) => {
  try {
    const { amount } = req.body;

    // Here we would typically create a Stripe Checkout Session
    // We will just mock creation of a pending transaction that auto-completes

    const transaction = await Transaction.create({
      user: req.user.id,
      type: 'deposit',
      amount,
      status: 'completed', // Mock auto-complete
      stripeSessionId: `mock_sess_${Math.random().toString(36).substring(2)}`
    });

    res.status(200).json({
      success: true,
      data: transaction,
      message: 'Deposit successful' // In real app, we'd return checkout URL
    });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Deposit failed' });
  }
});

// @desc    Mock withdraw
// @route   POST /api/payments/withdraw
// @access  Private
router.post('/withdraw', protect, async (req, res) => {
  try {
    const { amount } = req.body;

    const transaction = await Transaction.create({
      user: req.user.id,
      type: 'withdraw',
      amount,
      status: 'pending', // Requires admin approval for real withdraw
    });

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Withdraw failed' });
  }
});

// @desc    Transfer mock (Angel Investment / Send to entrepreneur)
// @route   POST /api/payments/transfer
// @access  Private
router.post('/transfer', protect, async (req, res) => {
  try {
    const { recipientId, amount } = req.body;

    if (!recipientId) return res.status(400).json({ success: false, error: 'Please provide recipientId' });

    const transaction = await Transaction.create({
      user: req.user.id,
      type: 'transfer',
      amount,
      recipientId,
      status: 'completed',
    });

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Transfer failed' });
  }
});

module.exports = router;
