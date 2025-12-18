import React from "react";
import { Button } from "../../ui/button";

export default function SubscribedRestaurantsModal({ restaurants, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-fadeInUp">
      <div className="bg-gradient-to-br from-black/90 to-zinc-900/70 border border-amber-500 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg text-amber-300 font-bold">Subscribed Restaurants</h3>
          <Button className="border border-amber-500 text-amber-300 bg-transparent px-4 py-1 rounded" onClick={onClose}>Close</Button>
        </div>
        <ul className="space-y-1">
          {restaurants.length === 0 && <li className="text-amber-200 italic text-center">No subscriptions</li>}
          {restaurants.map((r, idx) => (
            <li key={idx} className="text-amber-100 border-b border-amber-800 py-1">{r.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
