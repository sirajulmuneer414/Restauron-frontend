import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { useAxios } from "../../../axios/instances/axiosInstances";
import SubscriptionPackageModal from "./SubscriptionPackageModal";
import SubscribedRestaurantsModal from "./SubscribedRestaurantsModal";
import { Search } from "lucide-react";

const statusColors = {
  ACTIVE: "bg-green-600/20 text-green-300 border-green-700/50",
  HIDDEN: "bg-gray-600/20 text-gray-300 border-gray-700/50",
  ARCHIVED: "bg-red-600/20 text-red-300 border-red-700/50"
};

function formatDateLocal(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-CA"); 
}

export default function AdminSubscriptionsPage() {
  const { axiosAdminInstance } = useAxios();
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPackage, setEditPackage] = useState(null);
  const [showRestaurants, setShowRestaurants] = useState(false);
  const [restaurantsFor, setRestaurantsFor] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data
  async function fetchPackages() {
    setIsLoading(true);
    try {
      const res = await axiosAdminInstance.get("/subscriptions/packages");
      const data = res.data || [];
      setPackages(data);
      setFilteredPackages(data);
    } catch (err) {
      console.error("Failed to fetch packages", err);
      setPackages([]);
      setFilteredPackages([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchPackages();
  }, [axiosAdminInstance]);

  // Search Filtering Logic
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const filtered = packages.filter(pkg => 
      pkg.name.toLowerCase().includes(lowerSearch) || 
      (pkg.offer && pkg.offer.description && pkg.offer.description.toLowerCase().includes(lowerSearch))
    );
    setFilteredPackages(filtered);
  }, [search, packages]);


  // Handlers
  function openAddModal() {
    setEditPackage(null); 
    setModalOpen(true);
  }

  function openEditModal(pkg) {
    setEditPackage(pkg); 
    setModalOpen(true);
  }

  async function openSubscribedRestaurants(pkg) {
    try {
      const res = await axiosAdminInstance.get(`/subscriptions/usage/${pkg.id}`);
      setRestaurantsFor(res.data || []);
      setShowRestaurants(true);
    } catch (err) {
      console.error("Failed to fetch usage", err);
    }
  }

  async function handleToggleStatus(pkg) {
    try {
      await axiosAdminInstance.put(`/subscriptions/package/${pkg.id}/status`, {
        status: pkg.status === "ACTIVE" ? "HIDDEN" : "ACTIVE"
      });
      fetchPackages();
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  }

  async function handleArchive(pkg) {
    if (!window.confirm("Archive (hide) this package?")) return;
    try {
      await axiosAdminInstance.delete(`/subscriptions/package/${pkg.id}`);
      fetchPackages();
    } catch (err) {
      console.error("Failed to archive", err);
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-black/60 to-gray-500 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Subscription Packages</h1>
        <p className="text-gray-400 mt-1">Manage pricing, duration, and offers for restaurant subscriptions.</p>
      </div>

      {/* Controls / Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search packages..."
            className="bg-black/70 border border-gray-700 rounded-md pl-10 pr-4 py-2 w-full md:w-64 focus:outline-none focus:border-amber-500 text-white"
          />
        </div>
        <div>
          <Button 
            onClick={openAddModal}
            className="bg-amber-500 text-black font-semibold py-2 px-4 rounded-md hover:bg-amber-600 transition-colors"
          >
            + Add Package
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-b from-black/70 to-black/60">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-white">
            <thead>
              <tr className="bg-gray-900/70 text-white">
                <th className="py-3.5 px-4 text-left font-semibold border-b border-gray-800">Name</th>
                <th className="py-3.5 px-4 text-left font-semibold border-b border-gray-800">Duration</th>
                <th className="py-3.5 px-4 text-left font-semibold border-b border-gray-800">Price</th>
                <th className="py-3.5 px-4 text-left font-semibold border-b border-gray-800">Offer</th>
                <th className="py-3.5 px-4 text-left font-semibold border-b border-gray-800">Offer Expiry</th>
                <th className="py-3.5 px-4 text-left font-semibold border-b border-gray-800">Status</th>
                <th className="py-3.5 px-4 text-center font-semibold border-b border-gray-800">Usage</th>
                <th className="py-3.5 px-4 text-center font-semibold border-b border-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                        <td className="p-4"><div className="h-4 bg-gray-700 rounded w-3/4"></div></td>
                        <td className="p-4"><div className="h-4 bg-gray-700 rounded w-1/2"></div></td>
                        <td className="p-4"><div className="h-4 bg-gray-700 rounded w-1/4"></div></td>
                        <td className="p-4"><div className="h-4 bg-gray-700 rounded w-full"></div></td>
                        <td className="p-4"><div className="h-4 bg-gray-700 rounded w-full"></div></td>
                        <td className="p-4"><div className="h-6 bg-gray-700 rounded-full w-16"></div></td>
                        <td className="p-4"><div className="h-4 bg-gray-700 rounded w-8 mx-auto"></div></td>
                        <td className="p-4"><div className="h-8 bg-gray-700 rounded w-24 mx-auto"></div></td>
                    </tr>
                 ))
              ) : filteredPackages.length > 0 ? (
                filteredPackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-white">{pkg.name}</td>
                    <td className="py-3 px-4 text-gray-300">{pkg.durationAmount} {pkg.durationType}</td>
                    <td className="py-3 px-4 font-bold text-amber-400">₹{pkg.price}</td>
                    <td className="py-3 px-4">
                      {pkg.offer ? (
                        <span className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded text-xs border border-amber-500/20">
                          {pkg.offer.discount} {pkg.offer.discountType === "percent" ? "%" : "₹"} OFF
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {pkg.offer && pkg.offer.expiry ? (
                         <span className={new Date(pkg.offer.expiry) < new Date() ? "text-red-400 font-semibold" : ""}>
                           {formatDateLocal(pkg.offer.expiry)}
                         </span>
                      ) : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColors[pkg.status] || 'bg-gray-600/20 text-gray-300 border-gray-700/50'}`}>
                        {pkg.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => openSubscribedRestaurants(pkg)}
                        className="text-blue-400 hover:text-blue-300 hover:underline font-medium"
                      >
                        {pkg.subscribedRestaurantsCount || 0}
                      </button>
                    </td>
                    <td className="py-3 px-4 flex justify-center gap-2">
                      <Button onClick={() => openEditModal(pkg)} className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded text-xs h-8">
                        Edit
                      </Button>
                      <Button onClick={() => handleToggleStatus(pkg)} className={`py-1 px-3 rounded text-xs h-8 ${pkg.status === "ACTIVE" ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-green-700 hover:bg-green-600 text-white"}`}>
                        {pkg.status === "ACTIVE" ? "Hide" : "Activate"}
                      </Button>
                      <Button onClick={() => handleArchive(pkg)} className="bg-red-900/40 border border-red-900 hover:bg-red-800 text-red-200 py-1 px-3 rounded text-xs h-8">
                        Archive
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center p-10 text-gray-400">
                     No packages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer / Item Count */}
        <div className="border-t border-gray-800 px-4 py-3 bg-black/60 text-xs text-gray-400">
           Showing {filteredPackages.length} package(s)
        </div>
      </div>

      {modalOpen && (
        <SubscriptionPackageModal
          onClose={() => setModalOpen(false)}
          existingPackage={editPackage}
          refreshPackages={fetchPackages}
          axiosAdminInstance={axiosAdminInstance}
        />
      )}

      {showRestaurants && (
        <SubscribedRestaurantsModal
          restaurants={restaurantsFor}
          onClose={() => setShowRestaurants(false)}
        />
      )}
    </div>
  );
}

