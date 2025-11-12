import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { X } from "lucide-react";

const AddOrderItemModal = ({ open, onClose, menuItems, onAdd }) => {
  const [picked, setPicked] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  useEffect(() => {
    setPicked(null);
    setQuantity(1);
    setNote("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" style={{ backdropFilter: "blur(2px)" }}>
      <div className="bg-[#24262B] rounded-2xl px-8 py-6 shadow-2xl min-w-[320px] max-w-[95vw] w-full relative">
        <button className="absolute right-3 top-3 text-xl text-gray-400 hover:text-yellow-500" onClick={onClose}><X size={22}/></button>
        <div className="mb-2">
          <h2 className="text-xl font-bold text-yellow-400 leading-tight">Add Order Item</h2>
        </div>
        <div className="mb-5">
          <label className="block text-gray-300 mb-1">Select Item</label>
          <select className="bg-gray-800 text-white rounded-md px-3 py-2 w-full"
            value={picked?.encryptedMenuItemId || ""}
            onChange={e => {
              const found = menuItems.find(i => i.encryptedMenuItemId === e.target.value);
              setPicked(found || null);
            }}>
            <option value="" disabled>Select menu item...</option>
            {menuItems.map(mi => (
              <option key={mi.encryptedMenuItemId} value={mi.encryptedMenuItemId}>
                {mi.name} (₹{mi.price})
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4 flex gap-6">
          <div>
            <label className="block text-gray-300 mb-1">Quantity</label>
            <input type="number" min={1} max={99} value={quantity}
              onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
              className="bg-gray-800 rounded-md px-3 py-2 w-20 text-white" />
          </div>
          <div className="flex-grow">
            <label className="block text-gray-300 mb-1">Note <span className="text-xs text-gray-500">(optional)</span></label>
            <input type="text" value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a note or instruction..."
              className="bg-gray-800 w-full rounded-md px-3 py-2 text-white"
              maxLength={120}
            />
          </div>
        </div>
        <div className="flex justify-between items-center mb-5 mt-1">
          <span className="text-gray-400">Item Total:</span>
          <span className="text-xl font-bold text-yellow-300 font-mono">
            ₹{picked ? (picked.price * quantity).toFixed(2) : '0.00'}
          </span>
        </div>
        <div className="flex gap-4">
          <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
            disabled={!picked}
            onClick={() => {
              onAdd({
                ...picked,
                quantity,
                note,
                itemTotal: picked.price * quantity,
                priceAtOrder: picked.price
              });
            }}
          >Add Item</Button>
          <Button className="bg-gray-700 hover:bg-gray-600 text-white font-semibold" variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default AddOrderItemModal;