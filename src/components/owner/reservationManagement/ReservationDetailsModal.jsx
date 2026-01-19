import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { useAxios } from '../../../axios/instances/axiosInstances';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const statusColorMap = {
  CONFIRMED: "text-green-400 border-green-600",
  PENDING: "text-yellow-400 border-yellow-700",
  CANCELLED: "text-red-500 border-red-700",
};

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CANCELLED", label: "Cancelled" }
];

export default function ReservationDetailsModal({ reservation, onClose }) {
  const [currentStatus, setCurrentStatus] = useState(reservation.currentStatus || "PENDING");
  const [remark, setRemark] = useState(reservation.remark || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { axiosOwnerInstance } = useAxios();
  const user = useSelector((state) => state.userSlice.user);
  const isReadOnly = user?.restaurantAccessLevel === 'READ_ONLY';

  // Only allow status change and remark edit
  const handleStatusChange = (e) => {
    if (isReadOnly) {
      toast.error("Cannot change status in Read-Only mode.");
      return;
    }
    setCurrentStatus(e.target.value);
  };

  const handleUpdate = async (e) => {
    if (isReadOnly) {
      toast.error("Cannot update reservation in Read-Only mode.");
      return;
    }
    e.preventDefault();
    setLoading(true);
    setError(null);
    const nowDate = new Date();
    const statusChangeEntry = {
      status: currentStatus,
      date: nowDate.toISOString().slice(0, 10),
      time: nowDate.toTimeString().slice(0, 8),
      doneBy: "OWNER"
    };
    try {
      await axiosOwnerInstance.put(`/reservations/${reservation.id}`, {
        currentStatus,
        remark,
        // Append new status entry
        timestamps: [
          ...(reservation.timestamps || []),
          statusChangeEntry
        ]
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update reservation.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isReadOnly) {
      toast.error("Cannot delete reservation in Read-Only mode.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this reservation?")) return;
    setLoading(true);
    try {
      await axiosOwnerInstance.delete(`/reservations/${reservation.id}`);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete reservation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 overflow-y-auto">
      <form onSubmit={handleUpdate} className="bg-gradient-to-br from-black/80 to-gray-900/70 w-full max-w-lg rounded-2xl border-amber-700 border-2 shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-amber-400 mb-5">Reservation Details</h2>
        {error && <div className="text-red-400 mb-3 text-center italic">{error}</div>}
        
        {/* Info display */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-amber-100 text-sm">
          <div>
            <span className="font-semibold block">Customer Name:</span>
            <span>{reservation.customerName || "—"}</span>
          </div>
          <div>
            <span className="font-semibold block">Customer Email:</span>
            <span>{reservation.customerEmail || "—"}</span>
          </div>
          <div>
            <span className="font-semibold block">Customer Phone:</span>
            <span>{reservation.customerPhone}</span>
          </div>
          <div>
            <span className="font-semibold block">Customer ID:</span>
            <span>{reservation.customerEncryptedId || "—"}</span>
          </div>
          <div>
            <span className="font-semibold block">Reservation Date:</span>
            <span>{reservation.reservationDate}</span>
          </div>
          <div>
            <span className="font-semibold block">Reservation Time:</span>
            <span>{reservation.reservationTime}</span>
          </div>
          <div>
            <span className="font-semibold block">No. of People:</span>
            <span>{reservation.noOfPeople}</span>
          </div>
          <div>
            <span className="font-semibold block">Made By:</span>
            <span>{reservation.reservationDoneBy || "—"}</span>
          </div>
        </div>

        {/* Current status */}
        <div className="mb-4">
          <span className="font-semibold text-amber-400 block mb-1">Current Status</span>
          <select
            value={currentStatus}
            onChange={handleStatusChange}
            className="py-2 px-4 rounded w-full border bg-black/75 border-amber-700 text-amber-200 mb-1"
            disabled={loading}
          >
            {statusOptions.map(opt =>
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            )}
          </select>
          <div className={`inline-block mt-1 px-3 py-1 border font-semibold rounded-full ${statusColorMap[currentStatus] || "text-gray-300 border-gray-800"}`}>
            {currentStatus}
          </div>
        </div>

        {/* Timestamp History */}
        {reservation.timestamps?.length > 0 && (
          <div className="mb-4">
            <p className="font-semibold text-amber-300">Status History</p>
            <div className="bg-black/50 rounded p-2 mt-1 text-xs text-gray-300 border border-amber-900 max-h-32 overflow-y-auto">
              {reservation.timestamps.slice().reverse().map((t, idx) => (
                <div key={idx}>
                  {t.date} {t.time} — <span className="capitalize">{t.status}</span> <span className="italic">({t.doneBy})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editable Remark */}
        <div className="mb-4">
          <label className="block mb-1 text-amber-300 font-semibold">Remark</label>
          <textarea
            name="remark"
            value={remark}
            onChange={e => setRemark(e.target.value)}
            className="w-full bg-black/50 border border-amber-700 text-amber-100 px-3 py-2 rounded"
            rows={2}
            placeholder="Any special remarks about this reservation?"
            disabled={loading}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-3">
          <Button type="button" onClick={onClose} className="border border-amber-500 text-amber-500 bg-transparent" disabled={loading}>Close</Button>
          <Button type="submit" className="bg-amber-500 text-black font-bold" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
          <Button type="button" className="bg-red-600 text-white font-bold" onClick={handleDelete} disabled={loading}>
            Delete
          </Button>
        </div>
      </form>
    </div>
  );
}

