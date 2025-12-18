import React, { useState } from "react";
import { Button } from "../../ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const durationTypes = ["days", "weeks", "months", "years"];
const statusTypes = ["ACTIVE", "HIDDEN", "ARCHIVED"];
const discountTypes = ["percent", "cash"];

export default function SubscriptionPackageModal({ onClose, existingPackage, refreshPackages, axiosAdminInstance }) {
  const isEditing = !!existingPackage;
  const [form, setForm] = useState(() => ({
    name: existingPackage?.name || "",
    durationAmount: existingPackage?.durationAmount || 30,
    durationType: existingPackage?.durationType || "days",
    price: existingPackage?.price || "",
    status: existingPackage?.status || "ACTIVE",
    offer: existingPackage?.offer || {
      discount: "",
      discountType: "percent",
      discountDescription: "",
      expiry: ""
    },
    description: existingPackage?.description || "",
  }));
  const [showOffer, setShowOffer] = useState(!!existingPackage?.offer);
  const [loading, setLoading] = useState(false);

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }
  function handleOfferChange(e) {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      offer: {
        ...f.offer,
        [name]: value
      }
    }));
  }
  function handleOfferExpiryDate(date) {
    // always set as YYYY-MM-DD in local timezone (date picker gives Date obj)
    if (!date) return;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    setForm(f => ({
      ...f,
      offer: {
        ...f.offer,
        expiry: `${yyyy}-${mm}-${dd}`
      }
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate fields as needed here (not shown for brevity)
      if (isEditing) {
        await axiosAdminInstance.put(`/subscriptions/package/${existingPackage.id}`, form);
      } else {
        await axiosAdminInstance.post("/subscriptions/package", form);
      }
      if (refreshPackages) await refreshPackages();
      onClose();
    } catch (err) {
      alert("Failed to save package: " + (err?.response?.data?.message || ""));
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fadeInUp">
      <form onSubmit={handleSubmit}
        className="bg-gradient-to-br from-black/90 to-zinc-900/80 border border-amber-500 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg text-amber-300 font-bold">{isEditing ? "Edit" : "Add"} Package</h3>
          <Button type="button" className="border border-amber-500 text-amber-300 bg-transparent px-4 py-1 rounded" onClick={onClose}>Close</Button>
        </div>
        <div className="flex flex-col gap-3 mb-6">
          <input name="name" value={form.name} onChange={handleFormChange} required
            placeholder="Package Name" className="p-2 rounded bg-black/80 border border-amber-800 text-white"/>
          <div className="flex gap-3">
            <input name="durationAmount" type="number" value={form.durationAmount}
              onChange={handleFormChange} required min={1}
              className="w-24 p-2 rounded bg-black/80 border border-amber-800 text-white" />
            <select name="durationType" value={form.durationType}
              onChange={handleFormChange} className="p-2 rounded bg-black/80 border border-amber-800 text-white">
              {durationTypes.map(dt => <option key={dt} value={dt}>{dt}</option>)}
            </select>
            <input name="price" type="number" value={form.price}
              onChange={handleFormChange} min={0} step="0.01"
              placeholder="Price" className="w-32 p-2 rounded bg-black/80 border border-amber-800 text-white"/>
          </div>
          <select name="status" value={form.status}
            onChange={handleFormChange} className="p-2 rounded bg-black/80 border border-amber-800 text-white">
            {statusTypes.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
          <textarea name="description" rows={2} value={form.description} onChange={handleFormChange}
            placeholder="Description" className="p-2 rounded bg-black/80 border border-amber-800 text-white"/>
        </div>
        {/* Offer section */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={showOffer}
              onChange={e => setShowOffer(e.target.checked)} id="offerCheck"/>
            <label htmlFor="offerCheck" className="text-amber-300 font-semibold text-sm">Has Offer?</label>
          </div>
          {showOffer && (
            <div className="grid grid-cols-1 gap-3 mt-2">
              <div className="flex gap-3">
                <input type="number" name="discount"
                  value={form.offer.discount}
                  onChange={handleOfferChange} min={0}
                  placeholder="Discount Value"
                  className="w-24 p-2 rounded bg-black/80 border border-amber-800 text-white"/>
                <select name="discountType" value={form.offer.discountType}
                        onChange={handleOfferChange}
                        className="p-2 rounded bg-black/80 border border-amber-800 text-white">
                  {discountTypes.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                </select>
                <DatePicker
                  selected={form.offer.expiry ? new Date(form.offer.expiry) : null}
                  onChange={handleOfferExpiryDate}
                  dateFormat="yyyy-MM-dd"
                  minDate={new Date()}
                  placeholderText="Offer Expiry Date"
                  className="bg-black/80 border border-amber-800 p-2 rounded text-white w-36"
                />
              </div>
              <input name="discountDescription" value={form.offer.discountDescription}
                  onChange={handleOfferChange} placeholder="Offer Description"
                  className="p-2 rounded bg-black/80 border border-amber-800 text-white"/>
            </div>
          )}
        </div>
        <Button type="submit"
                className="bg-amber-500 text-black font-bold w-full"
                disabled={loading}
        >{loading ? "Saving..." : isEditing ? "Update Package" : "Add Package"}</Button>
      </form>
    </div>
  );
}
