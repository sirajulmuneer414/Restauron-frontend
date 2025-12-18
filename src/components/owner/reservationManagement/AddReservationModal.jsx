import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "../../ui/button";
import { useAxios } from "../../../axios/instances/axiosInstances";

// Regex for basic validation
const phoneRegex = /^[0-9]{7,15}$/; // adjust as needed
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CANCELLED", label: "Cancelled" }
];

const amberDatePickerCss = `
.react-datepicker { background: #181e25; border: 1px solid #d97706; color: #fde68a; border-radius: 12px; overflow: hidden;}
.react-datepicker__header { background: #1e1b16; border-bottom: 1px solid #fbbf24; color: #fde68a;}
.react-datepicker__day, .react-datepicker__day-name { color: #fbbf24; }
.react-datepicker__day--selected, .react-datepicker__day--keyboard-selected,
.react-datepicker__day--today { background: #f59e42; color: #fff;}
.react-datepicker__day:hover { background: #fbbf24; color: #181e25; }
.react-datepicker__time-container .react-datepicker__time { background: #1e1b16; color: #fde68a;}
.react-datepicker__current-month, .react-datepicker-time__header,
.react-datepicker-year-header { color: #fbbf24; }
`;

export default function AddReservationModal({ onClose, onSuccess }) {
  const { axiosOwnerInstance } = useAxios();

  // Customer fields/state
  const [customerFields, setCustomerFields] = useState({
    name: "",
    email: "",
    phone: "",
    customerEncryptedId: null,
  });
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState(null);
  const [customerSearched, setCustomerSearched] = useState(false);

  // Reservation core fields
  const [date, setDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotValue, setSlotValue] = useState("");
  const [maxPeople, setMaxPeople] = useState(null); // Max for the selected slot
  const [people, setPeople] = useState("");
  const [peopleError, setPeopleError] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotsStatus, setSlotsStatus] = useState({ loading: false, error: null });

  // Slots have format: { slotFrom, slotTo, maxNoOfPeoplePerReservation, ... }
  const canAdd =
    !!customerFields.phone &&
    !!date &&
    !!slotValue &&
    people &&
    Number(people) > 0 &&
    Number(people) <= (maxPeople || 0) &&
    slots.length > 0 &&
    !loading &&
    !slotsStatus.loading;

  // --- Customer fetch logic (debounced)
  const debounceRef = useRef(null);

  function handleCustFieldChange(e) {
    setCustomerSearched(false);
    setCustomerError(null);
    setCustomerFields(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
      customerEncryptedId: null, // reset match on edit
    }));
  }


  function toLocalYyyyMmDd(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


  useEffect(() => {
    if (
      (customerFields.phone && phoneRegex.test(customerFields.phone)) ||
      (customerFields.email && emailRegex.test(customerFields.email))
    ) {
      // Only search if at least one field is valid
      setCustomerLoading(true);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await axiosOwnerInstance.get("/customer/check", {

         params: { 
              email: customerFields.email || undefined,
              phone: customerFields.phone || undefined,
         }
            
          });
          if (res.data && res.data.encryptedId) {
            setCustomerFields({
              name: res.data.name || "",
              email: res.data.email || "",
              phone: res.data.phone || "",
              customerEncryptedId: res.data.encryptedId
            });
          }
          setCustomerSearched(true);
        } catch (err) {
          setCustomerError("Customer not found. You may create a new one.");
          setCustomerFields(f => ({
            ...f,
            customerEncryptedId: null
          }));
        }
        setCustomerLoading(false);
      }, 500);
      return () => clearTimeout(debounceRef.current);
    }
  // eslint-disable-next-line
  }, [customerFields.email, customerFields.phone]);

  function handleClearCustomer() {
    setCustomerFields({ name: "", email: "", phone: "", customerEncryptedId: null });
    setCustomerError(null);
    setCustomerSearched(false);
  }

  // --- Slot fetching logic
  useEffect(() => {
    if (!date) return;
    setSlots([]);
    setSlotValue("");
    setPeople("");
    setMaxPeople(null);
    setSlotsStatus({ loading: true, error: null });

    (async () => {
      try {
        // API: /reservations/available-slots?date=YYYY-MM-DD
        const apiDate = toLocalYyyyMmDd(date);
        const { data } = await axiosOwnerInstance.get("/reservation-availability/getSlots", {
          params:{
           date: apiDate
          }
        });
        // Backend returns array of { slotFrom, slotTo, maxNoOfPeoplePerReservation }
        console.log("Fetched slots:", data);
        setSlots(data || []);
        setSlotsStatus({ loading: false, error: null });
      } catch (err) {
        setSlots([]);
        setSlotsStatus({ loading: false, error: "No slots available for this day." });
      }
    })();
  }, [date, axiosOwnerInstance]);

  // -- Handle slot pick: set maxPeople
  useEffect(() => {
    if (!slotValue) {
      setMaxPeople(null);
      return;
    }
    const s = slots.find(
      s => `${s.slotFrom}-${s.slotTo}` === slotValue
    );
    setMaxPeople(s ? s.maxNoOfPeoplePerReservation : null);
    // Reset number of people if changed slot
    setPeople("");
    setPeopleError("");
  }, [slotValue, slots]);

  function handlePeopleChange(e) {
    const value = e.target.value.replace(/\D/, ""); // No decimals
    setPeople(value);
    if (maxPeople && value && Number(value) > maxPeople) {
      setPeopleError(`Max: ${maxPeople}`);
    } else {
      setPeopleError("");
    }
  }

  function getFormattedDate(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  // --- Reservation submission
  async function handleSubmit(e) {
    e.preventDefault();
    if (!canAdd) return;
    setLoading(true);
    try {
      const reservationTime = slotValue;
      // Timestamp for status
      const nowDate = new Date();
      const timeStamp = {
        status: status,
        date: getFormattedDate(nowDate),
        time: nowDate.toTimeString().slice(0, 8),
        doneBy: "OWNER"
      };
      await axiosOwnerInstance.post("/reservations", {
        customerEncryptedId: customerFields.customerEncryptedId || null,
        customerName: customerFields.name || null,
        customerEmail: customerFields.email || null,
        customerPhone: customerFields.phone,
        reservationDate: getFormattedDate(date),
        reservationTime,
        noOfPeople: Number(people),
        currentStatus: status,
        timestamps: [timeStamp],
        remark: remark || null
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to add reservation: " + (err?.response?.data?.message || ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm overflow-y-auto">
      <style>{amberDatePickerCss}</style>
        <div className="w-full flex justify-center items-center min-h-screen py-8">
    <form className="bg-gradient-to-br from-black/80 to-gray-900/60 w-full max-w-lg rounded-2xl shadow-2xl border-2 border-amber-600 p-8 max-h-[90vh] overflow-y-auto"
      onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-amber-400 mb-4">Add Reservation</h2>
        
        {/* Customer Info */}
        <div className="mb-6 bg-black/30 border border-amber-800 rounded-lg p-4">
          <label className="block mb-1 text-xs text-amber-200">Customer Name</label>
          <input name="name" autoComplete="off"
            className="w-full bg-black/60 border border-amber-700 text-white px-3 py-2 rounded mb-3"
            value={customerFields.name}
            onChange={handleCustFieldChange}
            disabled={!!customerFields.customerEncryptedId}
            placeholder="Enter name"
          />
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <label className="block mb-1 text-xs text-amber-200">Email</label>
              <input name="email" type="email" autoComplete="off"
                className="w-full bg-black/60 border border-amber-700 text-white px-3 py-2 rounded"
                value={customerFields.email}
                onChange={handleCustFieldChange}
                disabled={!!customerFields.customerEncryptedId}
                placeholder="Enter email"
                onBlur={e => {
                  if (e.target.value && !emailRegex.test(e.target.value)) {
                    setCustomerError("Invalid email.");
                  }
                }}
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-xs text-amber-200">Phone<span className="text-red-400">*</span></label>
              <input name="phone" type="text" autoComplete="off"
                className="w-full bg-black/60 border border-amber-700 text-white px-3 py-2 rounded"
                value={customerFields.phone}
                onChange={handleCustFieldChange}
                disabled={!!customerFields.customerEncryptedId}
                placeholder="Enter phone"
                maxLength={15}
                onBlur={e => {
                  if (e.target.value && !phoneRegex.test(e.target.value)) {
                    setCustomerError("Invalid phone.");
                  }
                }}
              />
            </div>
          </div>
          {/* Customer found indicator */}
          {customerFields.customerEncryptedId && (
            <div className="mb-2 flex items-center text-green-400 gap-2 text-xs">
              Matched Customer (ID present).
              <Button type="button" onClick={handleClearCustomer} className="bg-red-800 border px-2 py-0.5 ml-2 text-white text-xs rounded">Remove</Button>
            </div>
          )}
          {customerLoading && <div className="text-xs text-amber-300">Searching customer...</div>}
          {customerError && <div className="text-xs text-red-400">{customerError}</div>}
        </div>

        {/* Date & Slot */}
        <div className="mb-6">
          <label className="block mb-1 text-xs text-amber-200">Date<span className="text-red-400">*</span></label>
          <DatePicker
            selected={date}
            onChange={(dt) => setDate(dt)}
            minDate={new Date()}
            className="bg-black/60 border border-amber-700 text-amber-100 px-3 py-2 rounded w-full"
            placeholderText="Pick a reservation date"
            calendarClassName=""
            dateFormat="yyyy-MM-dd"
            required
          />
        </div>
        <div className="mb-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block mb-1 text-xs text-amber-200">Slot<span className="text-red-400">*</span></label>
              <select className="bg-black/60 border border-amber-700 text-amber-100 px-3 py-2 rounded w-full"
                value={slotValue}
                onChange={e => setSlotValue(e.target.value)}
                disabled={!slots.length || slotsStatus.loading}
                required
              >
                <option value="">Select slot...</option>
                {slots.map(s => (
                  <option key={s.slotFrom + "-" + s.slotTo} value={s.slotFrom + "-" + s.slotTo}>
                    {s.slotFrom} to {s.slotTo} (Max: {s.maxNoOfPeoplePerReservation})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-32">
              <label className="block mb-1 text-xs text-amber-200">No. of People<span className="text-red-400">*</span></label>
              <input
                type="number"
                min={1}
                max={maxPeople || ""}
                value={people}
                disabled={!maxPeople}
                className={`w-full bg-black/60 border ${peopleError ? "border-red-500" : "border-amber-700"} text-white px-3 py-2 rounded`}
                placeholder={maxPeople ? `1-${maxPeople}` : "Select slot first"}
                onChange={handlePeopleChange}
                required
              />
              {peopleError && <div className="text-xs text-red-400">{peopleError}</div>}
            </div>
          </div>
          {slotsStatus.loading && <div className="text-xs text-amber-300 pt-2">Loading slots...</div>}
          {slotsStatus.error && <div className="text-xs text-red-400 pt-2">{slotsStatus.error}</div>}
        </div>

        {/* Status */}
        <div className="mb-4">
          <label className="block mb-1 text-xs text-amber-200">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="bg-black/60 border border-amber-700 text-white px-3 py-2 rounded w-full"
          >
            {statusOptions.map(opt =>
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            )}
          </select>
        </div>
        {/* Remark */}
        <div className="mb-4">
          <label className="block mb-1 text-xs text-amber-200">Remark</label>
          <textarea
            value={remark}
            onChange={e => setRemark(e.target.value)}
            rows={2}
            placeholder="Any special remarks?"
            className="w-full bg-black/60 border border-amber-700 text-white px-3 py-2 rounded"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-8">
          <Button type="button" onClick={onClose} className="bg-black border border-amber-900 text-amber-300 hover:bg-amber-900/30 rounded-lg px-6 py-2">
            Cancel
          </Button>
          <Button type="submit" disabled={!canAdd}
            className={`bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg px-8 py-2 ${!canAdd ? "opacity-50 cursor-not-allowed" : ""}`}>
            {loading ? "Adding..." : "Add Reservation"}
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
}

