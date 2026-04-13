import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, ArrowUpCircle, ArrowDownCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [recipientId, setRecipientId] = useState('');

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('/api/payments/transactions');
      if (res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      toast.error('Could not fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/payments/deposit', { amount: Number(amount) });
      if (res.data.success) {
        toast.success('Deposit initiated. Redirecting to payment gateway...');
        fetchTransactions();
        setAmount('');
      }
    } catch (err) {
      toast.error('Deposit failed');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/payments/transfer', { amount: Number(amount), recipientId });
      if (res.data.success) {
        toast.success('Fund transfer successful');
        fetchTransactions();
        setAmount('');
        setRecipientId('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Transfer failed');
    }
  };

  const calculateBalance = () => {
    let balance = 0;
    transactions.forEach(tx => {
      if (tx.status === 'completed') {
        if (tx.type === 'deposit') balance += tx.amount;
        if (tx.type === 'transfer' && tx.user === user?.id) balance -= tx.amount;
        if (tx.type === 'transfer' && tx.recipientId === user?.id) balance += tx.amount;
      }
    });
    return balance;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Wallet</h1>
          <p className="text-gray-600">Manage your investments and funds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-primary-50 border border-primary-100">
            <CardBody>
              <div className="flex items-center">
                <div className="p-3 bg-primary-100 rounded-full mr-4">
                  <CreditCard size={24} className="text-primary-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-700">Available Balance</p>
                  <h3 className="text-2xl font-bold text-primary-900">${calculateBalance().toLocaleString()}</h3>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Add Funds</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleDeposit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount USD</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">Deposit Funds</Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Transfer Funds</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recipient ID</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" variant="outline">Transfer</Button>
              </form>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
            </CardHeader>
            <CardBody>
              {loading ? (
                <p>Loading...</p>
              ) : transactions.length === 0 ? (
                <p className="text-gray-500 py-4 text-center">No transactions yet.</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map(tx => {
                    const isCredit = tx.type === 'deposit' || (tx.type === 'transfer' && tx.recipientId === user?.id);
                    return (
                      <div key={tx._id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          {isCredit ? (
                            <ArrowDownCircle className="text-success-500" />
                          ) : (
                            <ArrowUpCircle className="text-error-500" />
                          )}
                          <div>
                            <p className="font-medium capitalize">{tx.type}</p>
                            <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className={`font-semibold ${isCredit ? 'text-success-600' : 'text-gray-900'}`}>
                            {isCredit ? '+' : '-'}${tx.amount.toLocaleString()}
                          </p>
                          <Badge variant={tx.status === 'completed' ? 'success' : 'secondary'} size="sm">
                            {tx.status === 'completed' ? <CheckCircle size={12} className="mr-1 inline" /> : <Clock size={12} className="mr-1 inline" />}
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
