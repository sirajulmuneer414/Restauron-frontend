import React, { useState } from "react";
import { Button } from "../../ui/button";
import { useAxios } from "../../../axios/instances/axiosInstances";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// --- Custom Datepicker Theme CSS ---
const amberDatePickerCss = `
.react-datepicker__portal {
  z-index: 60;
}
.react-datepicker {
  background: #181e25;
  border: 1px solid #d97706;
  color: #fde68a;
  border-radius: 12px;
  overflow: hidden;
}
.react-datepicker__header {
  background: #1e1b16;
  border-bottom: 1px solid #fbbf24;
  color: #fde68a;
}
.react-datepicker__day,
.react-datepicker__day-name {
  color: #fbbf24;
}
.react-datepicker__day--selected,
.react-datepicker__day--keyboard-selected,
.react-datepicker__day--today {
  background: #f59e42;
  color: #fff;
}
.react-datepicker__day:hover {
  background: #fbbf24;
  color: #fff;
}
.react-datepicker__time-container .react-datepicker__time {
  background: #1e1b16;
  color: #fde68a;
}
.react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header {
  color: #fbbf24;
}
`;

export default function AddReservationModal({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "PENDING",
    remark: "",
  });
  const [pickerDate, setPickerDate] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { axiosOwnerInstance } = useAxios();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!pickerDate) throw new Error("Please select a reservation date and time.");
      await axiosOwnerInstance.post("/reservations", {
        ...form,
        reservationTime: pickerDate.toISOString(),
      });
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to add reservation."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
      {/* Style inject for DatePicker theme */}
      <style>{amberDatePickerCss}</style>
      <form
        onSubmit={handleSubmit}
        className="
          bg-gradient-to-br from-black/80 to-gray-900/60 border-2 border-amber-600/40
          rounded-2xl shadow-2xl w-full max-w-2xl
          p-8
          max-h-[80vh]
          overflow-y-auto
        "
      >
        <h2 className="font-bold text-2xl text-amber-400 mb-6">
          Add Reservation
        </h2>
        {error && (
          <div className="text-red-400 mb-3 rounded border border-red-700 bg-red-800/40 px-3 py-2 font-semibold">
            {error}
          </div>
        )}

        <label className="block mb-3">
          <span className="text-amber-200 text-sm">Name</span>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full bg-black/60 border border-amber-700 focus:border-amber-400 text-white px-3 py-2 rounded-xl mt-1 transition-all"
            required
            autoFocus
          />
        </label>
        <label className="block mb-3">
          <span className="text-amber-200 text-sm">Email</span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-black/60 border border-amber-700 focus:border-amber-400 text-white px-3 py-2 rounded-xl mt-1 transition-all"
            required
          />
        </label>
        <label className="block mb-3">
          <span className="text-amber-200 text-sm">Phone</span>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            className="w-full bg-black/60 border border-amber-700 focus:border-amber-400 text-white px-3 py-2 rounded-xl mt-1 transition-all"
          />
        </label>
        <label className="block mb-3">
          <span className="text-amber-200 text-sm">Reservation Date & Time</span>
          <DatePicker
            selected={pickerDate}
            onChange={setPickerDate}
            showTimeSelect
            timeFormat="HH:mm"
            dateFormat="MMM d, yyyy h:mm aa"
            minDate={new Date()}
            className="w-full bg-black/60 border border-amber-700 focus:border-amber-400 text-amber-100 placeholder-amber-300 px-3 py-2 rounded-xl mt-1 transition-all outline-none"
            calendarClassName=""
            placeholderText="Select date and time"
            popperPlacement="auto"
            popperClassName="z-[100]"
          />
        </label>
        <label className="block mb-3">
          <span className="text-amber-200 text-sm">Status</span>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full bg-black/60 border border-amber-700 focus:border-amber-400 text-white px-3 py-2 rounded-xl mt-1 transition-all"
            required
          >
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>
        <label className="block mb-3">
          <span className="text-amber-200 text-sm">Remarks</span>
          <textarea
            name="remark"
            value={form.remark}
            onChange={handleChange}
            className="w-full bg-black/60 border border-amber-700 focus:border-amber-400 text-white px-3 py-2 rounded-xl mt-1 transition-all"
            rows={3}
            placeholder="Special requests or notes"
          />
        </label>
        <div className="flex gap-2 justify-end pt-3">
          <Button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="bg-black border border-amber-900 text-amber-300 hover:bg-amber-900/30 rounded-xl px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-black rounded-xl px-4 py-2 font-semibold transition-all"
          >
            {loading ? "Adding..." : "Add Reservation"}
          </Button>
        </div>
      </form>
    </div>
  );
}

