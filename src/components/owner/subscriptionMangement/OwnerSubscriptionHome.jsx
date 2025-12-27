import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, AlertCircle, CheckCircle2, Clock, RefreshCcw } from 'lucide-react';
import { useAxios } from '../../../axios/instances/axiosInstances';
import CommonLoadingSpinner from '../../loadingAnimations/CommonLoading';
import { Button } from '../../ui/button';

const OwnerSubscriptionHome = () => {
  const { axiosOwnerInstance } = useAxios();
  const navigate = useNavigate();

  const [data, setData] = useState(null); // { currentSubscription, recentPayments }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosOwnerInstance.get('/subscription/home');
      setData(res.data);
    } catch (err) {
      console.error('Subscription home load error:', err);
      setError('Could not load subscription details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

 const formatAmount = (amtInPaise) => {
  if (amtInPaise == null) return '-';

  // 1. Convert paise → rupees
  const amtInRupees = amtInPaise / 100;

  // 2. Format in Indian style with 2 decimals if needed
  return amtInRupees.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,  // or 2 if you want paise shown
    maximumFractionDigits: 2,
  });
};


  const current = data?.currentSubscription || null;
  const payments = data?.recentPayments || [];

  const statusChip = useMemo(() => {
    if (!current) return null;
    const base =
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold';
    switch (current.status) {
      case 'ACTIVE':
        return (
          <span className={`${base} bg-emerald-500/15 text-emerald-300 border border-emerald-500/40`}>
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case 'TRIAL':
        return (
          <span className={`${base} bg-sky-500/15 text-sky-300 border border-sky-500/40`}>
            <Clock className="w-3 h-3 mr-1" />
            Trial
          </span>
        );
      case 'EXPIRED':
        return (
          <span className={`${base} bg-red-500/15 text-red-300 border border-red-500/40`}>
            <AlertCircle className="w-3 h-3 mr-1" />
            Expired
          </span>
        );
      default:
        return (
          <span className={`${base} bg-gray-500/15 text-gray-300 border border-gray-500/40`}>
            Inactive
          </span>
        );
    }
  }, [current]);

  if (loading) return <CommonLoadingSpinner />;

  return (
    <div className="p-6 max-w-6xl mx-auto text-white space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Subscription Overview
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Manage your Restauron subscription and billing history.
          </p>
        </div>
        <Button
          onClick={() => navigate('/owner/subscription/plans')}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-5 py-2 rounded-lg shadow-md transition-all"
        >
          Explore Subscription Plans
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-200 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="text-xs underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Subscription Card */}
        <div className="lg:col-span-2 bg-gray-900/70 border border-gray-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-semibold">Current Subscription</h2>
              </div>
              {current && current.planName ? (
                <p className="text-gray-400 text-sm">
                  You are currently subscribed to
                  <span className="font-semibold text-yellow-400">
                    {' '}
                    {current.planName}
                  </span>
                  .
                </p>
              ) : (
                <p className="text-gray-400 text-sm">
                  You do not have an active subscription yet.
                </p>
              )}
            </div>
            {statusChip}
          </div>

          {current && current.planName ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">
                    Plan
                  </p>
                  <p className="font-semibold text-white">
                    {current.planName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">
                    Status
                  </p>
                  <p className="font-semibold">
                    {current.status === 'ACTIVE'
                      ? 'Active'
                      : current.status === 'TRIAL'
                      ? 'Trial'
                      : current.status === 'EXPIRED'
                      ? 'Expired'
                      : 'Inactive'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">
                    Start Date
                  </p>
                  <p className="font-semibold">{formatDate(current.startDate)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">
                    End Date
                  </p>
                  <p className="font-semibold">{formatDate(current.endDate)}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span>
                    {current.daysLeft > 0
                      ? `${current.daysLeft} day${
                          current.daysLeft === 1 ? '' : 's'
                        } remaining`
                      : 'Expires today or already expired'}
                  </span>
                </div>
                {typeof current.autoRenew === 'boolean' && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <RefreshCcw
                      className={`w-3 h-3 ${
                        current.autoRenew ? 'text-emerald-400' : 'text-gray-500'
                      }`}
                    />
                    <span>
                      Auto-renew:{' '}
                      <span
                        className={
                          current.autoRenew ? 'text-emerald-300' : 'text-gray-300'
                        }
                      >
                        {current.autoRenew ? 'Enabled' : 'Disabled'}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="mt-4 bg-gray-800/60 border border-dashed border-gray-700 rounded-xl p-4 text-sm text-gray-300 space-y-3">
              <p>
                To unlock all features of Restauron, choose a subscription plan
                that fits your restaurant.
              </p>
              <Button
                onClick={() => navigate('/owner/subscription/plans')}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded-lg"
              >
                Explore Plans
              </Button>
            </div>
          )}
        </div>

        {/* Quick Summary (optional small card) */}
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-semibold text-gray-200">
            Billing Snapshot
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Current plan</span>
              <span className="font-semibold text-white">
                {current?.planName || 'None'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className="font-semibold">
                {current?.status || 'INACTIVE'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Days remaining</span>
              <span className="font-semibold">
                {current?.daysLeft != null ? current.daysLeft : '-'}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={loadData}
            className="w-full border-gray-700 text-gray-200 hover:bg-gray-800 text-xs flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-3 h-3" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold">Recent Payments</h2>
          </div>
        </div>

        {payments.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No payments found yet. Once you subscribe to a plan, your payment
            history will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="py-2 pr-4 text-left font-medium">Date</th>
                  <th className="py-2 px-4 text-left font-medium">Amount</th>
                  <th className="py-2 px-4 text-left font-medium">Method</th>
                  <th className="py-2 px-4 text-left font-medium">Status</th>
                  <th className="py-2 pl-4 text-left font-medium">Reference</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  let statusClass =
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold';
                  if (p.status === 'SUCCESS') {
                    statusClass +=
                      ' bg-emerald-500/15 text-emerald-300 border border-emerald-500/40';
                  } else if (p.status === 'FAILED') {
                    statusClass +=
                      ' bg-red-500/15 text-red-300 border border-red-500/40';
                  } else {
                    statusClass +=
                      ' bg-yellow-500/15 text-yellow-300 border border-yellow-500/40';
                  }

                  return (
                    <tr
                      key={p.id}
                      className="border-b border-gray-900/60 last:border-0"
                    >
                      <td className="py-2 pr-4 text-gray-200">
                        {formatDateTime(p.paymentDate)}
                      </td>
                      <td className="py-2 px-4 font-semibold">
                        {formatAmount(p.amount)}
                      </td>
                      <td className="py-2 px-4 text-gray-300">
                        {p.method || '-'}
                      </td>
                      <td className="py-2 px-4">
                        <span className={statusClass}>{p.status}</span>
                      </td>
                      <td className="py-2 pl-4 text-gray-400">
                        <span
                          title={p.reference}
                          className="truncate max-w-[180px] inline-block align-middle"
                        >
                          {p.reference || '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerSubscriptionHome;
