import React, { useState } from 'react';
import { Button } from '../../ui/button';
import {useAxios} from '../../../axios/instances/axiosInstances';


export default function ReservationDetailsModal({ reservation, onClose }) {
  // Clone reservation to avoid mutating the parent object
  const [form, setForm] = useState({
    name: reservation.name || '',
    email: reservation.email || '',
    phone: reservation.phone || '',
    reservationTime: reservation.reservationTime ? reservation.reservationTime.slice(0, 16) : '', // for datetime-local input
    status: reservation.status || 'PENDING',
    remark: reservation.remark || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
    const { axiosOwnerInstance } = useAxios();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await axiosOwnerInstance.put(`/reservations/${reservation.id}`, {
        ...form,
        reservationTime: new Date(form.reservationTime).toISOString()
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update reservation.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <form onSubmit={handleUpdate} className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h2 className="font-bold text-xl mb-4">Reservation Details</h2>
        {error && <div className="text-red-500 mb-3">{error}</div>}

        <label className="block mb-2">
          <span className="text-gray-700 text-sm">Name</span>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded my-1"
            required
          />
        </label>
        <label className="block mb-2">
          <span className="text-gray-700 text-sm">Email</span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded my-1"
            required
          />
        </label>
        <label className="block mb-2">
          <span className="text-gray-700 text-sm">Phone</span>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded my-1"
          />
        </label>
        <label className="block mb-2">
          <span className="text-gray-700 text-sm">Reservation Time</span>
          <input
            name="reservationTime"
            type="datetime-local"
            value={form.reservationTime}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded my-1"
            required
          />
        </label>
        <label className="block mb-2">
          <span className="text-gray-700 text-sm">Status</span>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded my-1"
            required
          >
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>
        <label className="block mb-4">
          <span className="text-gray-700 text-sm">Remarks</span>
          <textarea
            name="remark"
            value={form.remark}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded my-1"
            rows={3}
            placeholder="Add any special instructions or remarks..."
          />
        </label>

        <div className="flex gap-2 justify-end pt-3">
          <Button type="button" onClick={onClose} disabled={loading}>Close</Button>
          <Button type="submit" className="bg-blue-600 text-white" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
          <Button type="button" className="bg-red-500 text-white" onClick={handleDelete} disabled={loading}>
            Delete
          </Button>
        </div>
      </form>
    </div>
  );
}

