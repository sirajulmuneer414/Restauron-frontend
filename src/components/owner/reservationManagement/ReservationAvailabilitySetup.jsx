import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "../../ui/button";
import { useAxios } from "../../../axios/instances/axiosInstances";

// Apply theme for DatePicker
const amberDatePickerCss = `
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
  color: #181e25;
}
.react-datepicker__time-container .react-datepicker__time {
  background: #1e1b16;
  color: #fde68a;
}
.react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header {
  color: #fbbf24;
}
`;

const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

function getEmptyWeek() {
  return DAYS.map(day => ({ day, slots: [] }));
}

function getEmptyOverride() {
  return {}; // date string (YYYY-MM-DD) -> slots[]
}

export default function ReservationAvailabilitySetup({ onClose }) {
  const { axiosOwnerInstance } = useAxios();
  const [week, setWeek] = useState(getEmptyWeek());
  const [overrides, setOverrides] = useState(getEmptyOverride());
  const [overrideTab, setOverrideTab] = useState(false);
  const [activeOverrideDate, setActiveOverrideDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  // Handle recurring week slot changes
  const handleSlotChange = (dayIdx, slotIdx, field, value) => {
    setWeek(prev =>
      prev.map((d, i) =>
        i === dayIdx
          ? {
              ...d,
              slots: d.slots.map((slot, j) =>
                j === slotIdx ? { ...slot, [field]: value } : slot
              ),
            }
          : d
      )
    );
  };

  const addSlot = (dayIdx) => {
    setWeek(prev =>
      prev.map((d, i) => (i === dayIdx
        ? { ...d, slots: [...d.slots, { from: "", to: "", max: 1 }] }
        : d
      ))
    );
  };

  const removeSlot = (dayIdx, slotIdx) => {
    setWeek(prev =>
      prev.map((d, i) =>
        i === dayIdx
          ? { ...d, slots: d.slots.filter((_, j) => j !== slotIdx) }
          : d
      )
    );
  };

  const copyDayToAll = (srcDayIdx) => {
    const srcSlots = week[srcDayIdx].slots.map(slot => ({ ...slot }));
    setWeek(week.map(() => ({ slots: [...srcSlots] })));
  };

  const clearAllDays = () => setWeek(getEmptyWeek());

  // --- Override management
  const setOverrideSlot = (slots) => {
    if (!activeOverrideDate) return;
    setOverrides(prev => ({
      ...prev,
      [activeOverrideDate]: slots,
    }));
  };

  const removeOverride = (dateStr) => {
    setOverrides(prev => {
      const copy = { ...prev };
      delete copy[dateStr];
      return copy;
    });
    if (activeOverrideDate === dateStr)
      setActiveOverrideDate(null);
  };

  // --- Prepare for submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccessMsg(null);
    try {
      await axiosOwnerInstance.post("/reservation-availability/weekly", week);
      await axiosOwnerInstance.post("/reservation-availability/overrides", overrides); // If separate, or merge if single endpoint
      setSuccessMsg("Availability saved!");
      setTimeout(() => setSuccessMsg(null), 1600);
      // onClose();
    } catch (err) {
      setError("Failed to save. " + (err?.response?.data?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  // Add override slot UI
  const handleAddOverrideSlot = () => {
    const dateStr = activeOverrideDate;
    const oldSlots = overrides[dateStr] || [];
    setOverrides(prev => ({
      ...prev,
      [dateStr]: [...oldSlots, { from: "", to: "", max: 1 }]
    }));
  };

  const handleOverrideSlotChange = (slotIdx, field, value) => {
    const dateStr = activeOverrideDate;
    setOverrides(prev => {
      const slots = [...(prev[dateStr] || [])];
      slots[slotIdx] = { ...slots[slotIdx], [field]: value };
      return { ...prev, [dateStr]: slots };
    });
  };

  const handleRemoveOverrideSlot = (slotIdx) => {
    const dateStr = activeOverrideDate;
    setOverrides(prev => {
      const slots = [...(prev[dateStr] || [])];
      slots.splice(slotIdx, 1);
      return { ...prev, [dateStr]: slots };
    });
  };

  // Format override list for select
  const overrideDates = Object.keys(overrides).sort();

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center backdrop-blur-sm">
      <style>{amberDatePickerCss}</style>
      <form className="bg-gradient-to-br from-black/80 to-gray-900/60 w-full max-w-3xl rounded-2xl p-8 border-2 border-amber-600 shadow-2xl max-h-[90vh] overflow-y-auto"
            onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-amber-400 mb-4">Set Reservation Availability</h2>

        <div className="flex gap-2 mb-6">
          <Button
            type="button"
            onClick={() => setOverrideTab(false)}
            className={`${!overrideTab ? "bg-amber-500 text-black" : "bg-black text-amber-100"} px-6 py-2 rounded-lg font-bold`}
          >
            Weekly Recurring
          </Button>
          <Button
            type="button"
            onClick={() => setOverrideTab(true)}
            className={`${overrideTab ? "bg-amber-500 text-black" : "bg-black text-amber-100"} px-6 py-2 rounded-lg font-bold`}
          >
            Temporary Override (Single Date)
          </Button>
        </div>

        {!overrideTab && (
          <div>
            <div className="mb-4">
              <Button type="button" onClick={clearAllDays} className="mr-2 bg-black border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black transition">Clear All Days</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {week.map((day, dIdx) => (
                <div key={day.day} className="bg-black/50 rounded-xl p-4 border border-amber-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-lg text-amber-400">{day.day}</span>
                    <Button type="button" onClick={() => copyDayToAll(dIdx)}
                      className="bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black text-xs py-1 px-2 rounded">Copy to All</Button>
                  </div>
                  {day.slots.length === 0 && (
                    <div className="text-amber-200 text-xs italic mb-3">No slots set. This day is not available for reservation.</div>
                  )}
                  {day.slots.map((slot, sIdx) => (
                    <div key={sIdx} className="flex gap-2 mb-2 items-center">
                      <input type="time" value={slot.from} required
                        onChange={e => handleSlotChange(dIdx, sIdx, "from", e.target.value)}
                        className="bg-black/60 border border-amber-700 text-amber-100 px-2 py-1 rounded focus:border-amber-400"
                      />
                      <span className="text-amber-300">to</span>
                      <input type="time" value={slot.to} required
                        onChange={e => handleSlotChange(dIdx, sIdx, "to", e.target.value)}
                        className="bg-black/60 border border-amber-700 text-amber-100 px-2 py-1 rounded focus:border-amber-400"
                      />
                      <input
                        type="number"
                        min={1}
                        value={slot.max}
                        onChange={e => handleSlotChange(dIdx, sIdx, "max", Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center bg-black/60 border border-amber-700 text-amber-100 px-2 py-1 rounded focus:border-amber-400"
                        placeholder="Max"
                        required
                      />
                      <span className="text-amber-200 text-xs">max</span>
                      <Button type="button"
                        onClick={() => removeSlot(dIdx, sIdx)}
                        className="bg-black/40 text-amber-500 hover:bg-red-900 hover:text-white px-2 py-1 text-xs font-bold rounded"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button type="button"
                    onClick={() => addSlot(dIdx)}
                    className="text-xs bg-amber-500 text-black hover:bg-amber-600 mt-2 px-4 py-1 rounded">
                    + Add Slot
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {overrideTab && (
          <div>
            <div className="mb-4">
              <span className="text-amber-200 font-semibold mr-2">Override date:</span>
              <DatePicker
                selected={activeOverrideDate ? new Date(activeOverrideDate) : null}
                onChange={date => {
                  setActiveOverrideDate(date ? date.toISOString().slice(0, 10) : null);
                }}
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
                className="bg-black/60 border border-amber-700 text-amber-100 px-3 py-1 rounded"
                calendarClassName=""
                placeholderText="Pick a date to override"
              />
              {activeOverrideDate && (
                <Button type="button"
                  onClick={() => removeOverride(activeOverrideDate)}
                  className="ml-2 border border-red-900 bg-red-900/40 text-red-200 text-xs rounded px-3 py-1 hover:bg-red-700">Remove Override</Button>
              )}
            </div>
            {activeOverrideDate && (
              <div className="bg-black/40 rounded-lg p-4 border border-amber-900 mb-2">
                <div className="font-semibold text-amber-400 mb-3">{activeOverrideDate} slots</div>
                {(overrides[activeOverrideDate] || []).map((slot, sIdx) => (
                  <div key={sIdx} className="flex gap-2 mb-2 items-center">
                    <input type="time" value={slot.from} required
                      onChange={e => handleOverrideSlotChange(sIdx, "from", e.target.value)}
                      className="bg-black/60 border border-amber-700 text-amber-100 px-2 py-1 rounded focus:border-amber-400"
                    />
                    <span className="text-amber-300">to</span>
                    <input type="time" value={slot.to} required
                      onChange={e => handleOverrideSlotChange(sIdx, "to", e.target.value)}
                      className="bg-black/60 border border-amber-700 text-amber-100 px-2 py-1 rounded focus:border-amber-400"
                    />
                    <input
                      type="number"
                      min={1}
                      value={slot.max}
                      onChange={e => handleOverrideSlotChange(sIdx, "max", Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center bg-black/60 border border-amber-700 text-amber-100 px-2 py-1 rounded focus:border-amber-400"
                      placeholder="Max"
                      required
                    />
                    <span className="text-amber-200 text-xs">max</span>
                    <Button type="button"
                      onClick={() => handleRemoveOverrideSlot(sIdx)}
                      className="bg-black/40 text-amber-500 hover:bg-red-900 hover:text-white px-2 py-1 text-xs font-bold rounded"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button type="button"
                  onClick={handleAddOverrideSlot}
                  className="text-xs bg-amber-500 text-black hover:bg-amber-600 mt-2 px-4 py-1 rounded">
                  + Add Slot
                </Button>
              </div>
            )}
            <div className="mt-4">
              <div className="font-semibold text-amber-400 mb-2">Current Overrides</div>
              {overrideDates.length === 0
                ? <div className="text-amber-200 text-xs italic">No temporary overrides set.</div>
                : overrideDates.map(dateStr => (
                    <div key={dateStr} className="flex items-center gap-2 mb-1">
                      <span className="text-amber-100 text-xs">{dateStr} ({overrides[dateStr].length} slot{overrides[dateStr].length !== 1 ? "s" : ""})</span>
                      <Button type="button" onClick={() => setActiveOverrideDate(dateStr)}
                        className="text-xs bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-black px-3 py-1 rounded">Edit</Button>
                      <Button type="button" onClick={() => removeOverride(dateStr)}
                        className="text-xs border border-red-900 bg-red-900/40 text-red-200 rounded px-2 py-1 hover:bg-red-700">Remove</Button>
                    </div>
                  ))
              }
            </div>
          </div>
        )}

        {successMsg && <div className="text-green-400 bg-green-900/40 border border-green-900 p-2 mt-4 rounded-lg">{successMsg}</div>}
        {error && <div className="text-red-400 bg-red-900/40 border border-red-900 p-2 mt-4 rounded-lg">{error}</div>}

        <div className="flex justify-end gap-2 mt-8">
          <Button type="button" onClick={onClose} className="bg-black border border-amber-900 text-amber-300 hover:bg-amber-900/30 rounded-lg px-6 py-2">Cancel</Button>
          <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg px-8 py-2">
            {loading ? "Saving..." : "Save Availability"}
          </Button>
        </div>
      </form>
    </div>
  );
}
