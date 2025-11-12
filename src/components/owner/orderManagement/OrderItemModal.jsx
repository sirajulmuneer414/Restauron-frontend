import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { X, Save } from "lucide-react";

// Props:
// open: boolean (whether modal is open)
// onClose: function (will close the modal)
// item: the order item (object) to edit { menuItemName, quantity, priceAtOrder, note, ... }
// onSave: function(updatedItem) - called with the updated item on save

const OrderItemModal = ({ open, onClose, item, onSave, onDelete }) => {
  const [editQuantity, setEditQuantity] = useState(item?.quantity || 1);
  const [editNote, setEditNote] = useState(item?.note || "");

  useEffect(() => {
    if (item) {
      setEditQuantity(item.quantity);
      setEditNote(item.note || "");
    }
  }, [item, open]);

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60" style={{ backdropFilter: "blur(2px)" }}>
      <div className="bg-[#24262B] rounded-2xl px-8 py-6 shadow-2xl min-w-[320px] max-w-[95vw] w-full relative">
        <button className="absolute right-3 top-3 text-xl text-gray-400 hover:text-yellow-500" onClick={onClose}><X size={22}/></button>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-yellow-400 leading-tight">Edit Order Item</h2>
          <div className="text-lg font-semibold text-white mt-1">{item.menuItemName}</div>
        </div>
        <div className="mb-4">
          <div className="mb-2">
            <label className="block text-gray-300 mb-1">Quantity</label>
            <input type="number" min={1} max={99} value={editQuantity}
              onChange={e => setEditQuantity(Math.max(1, Number(e.target.value)))}
              className="bg-gray-800 rounded-md px-3 py-2 w-24 text-white" />
            <span className="ml-4 font-mono text-yellow-400">× ₹{item.priceAtOrder.toFixed(2)}</span>
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Note <span className="text-xs text-gray-500">(optional)</span></label>
            <textarea rows={2} maxLength={120}
              className="bg-gray-800 w-full rounded-md px-3 py-2 text-white"
              value={editNote}
              onChange={e => setEditNote(e.target.value)}
              placeholder="Add a note or instruction..."
            />
          </div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-400">Item Total:</span>
          <span className="text-xl font-bold text-yellow-300 font-mono">
            ₹{(item.priceAtOrder * editQuantity).toFixed(2)}
          </span>
        </div>
        <div className="flex gap-4">
          <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
            onClick={() => onSave({
              ...item,
              quantity: editQuantity,
              note: editNote,
              itemTotal: item.priceAtOrder * editQuantity
            })}
          >Save</Button>
          <Button className="bg-gray-700 hover:bg-gray-600 text-white font-semibold" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button className="bg-red-500 hover:bg-red-600 text-white font-semibold ml-auto px-4" onClick={() => onDelete(item)}>Delete</Button>
        </div>
      </div>
    </div>
  );
};

export default OrderItemModal;