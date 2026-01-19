import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Search, Filter, Eye, List, Grid, CalendarDays, User, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/button';
import AddReservationModal from './AddReservationModal';
import ReservationDetailsModal from './ReservationDetailsModal';
import { useAxios } from '../../../axios/instances/axiosInstances';
import { useSelector } from 'react-redux';

function ReservationManagementPage() {
  const { axiosOwnerInstance } = useAxios();
  const navigate = useNavigate();

  // Data states
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);

  // UI states
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selected, setSelected] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(6); // per page
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Search and filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const user = useSelector((state) => state.userSlice.user);
  const isReadOnly = user?.restaurantAccessLevel === 'READ_ONLY';

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch reservations
  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size,
        status: filterStatus === 'ALL' ? undefined : filterStatus,
        search: debouncedSearch || undefined,
      };
      const response = await axiosOwnerInstance.get('/reservations', { params });
      const data = response.data;
      setReservations(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setPage(data.number || 0);
      setSize(data.size || size);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error fetching reservations.');
    } finally {
      setIsLoading(false);
      setShowSkeleton(false);
    }
  }, [page, size, filterStatus, debouncedSearch, axiosOwnerInstance]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations, showAddModal]);

  // Pagination logic
  const canGoPrev = page > 0;
  const canGoNext = page < totalPages - 1;
  const goFirst = () => setPage(0);
  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));
  const goLast = () => setPage(totalPages - 1);
  const goTo = (p) => setPage(p);

  const onPageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10) || 6;
    setSize(newSize);
    setPage(0);
  };

  const onFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setPage(0);
  };

  const pageButtons = useMemo(() => {
    const buttons = [];
    const maxButtons = 5;
    if (totalPages <= maxButtons) {
      for (let i = 0; i < totalPages; i++) buttons.push(i);
      return buttons;
    }
    const first = 0, last = totalPages - 1, start = Math.max(first + 1, page - 2), end = Math.min(last - 1, page + 2);
    const set = new Set([first]);
    for (let i = start; i <= end; i++) set.add(i);
    set.add(last);
    return Array.from(set).sort((a, b) => a - b);
  }, [page, totalPages]);

  const getStatusStyles = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-500/20 text-green-400 border-green-600/50';
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-600/50';
      case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-600/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-600/50';
    }
  };

  const addModalSuccess = () => {
    setShowAddModal(false);
  }

  // Skeletons for loading
  const renderSkeletonGrid = (count = 6) =>
    Array.from({ length: count }).map((_, i) => (
      <div key={`sk-grid-${i}`} className="bg-black/40 border border-gray-800 rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-3 bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-700 rounded-lg mt-4"></div>
        </div>
      </div>
    ));

  return (
    <div className="container mx-auto p-4 text-white bg-linear-to-b from-black/60 to-gray-500 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reservation Management</h1>
          <p className="text-gray-400">Handle bookings, search/filter, and manage availability and details.</p>
        </div>
        <Button
          disabled={isReadOnly}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          onClick={() => navigate('/owner/reservations/availability-setup')}
        >
          <CalendarDays size={18} className="inline-block mr-2" />
          Set Reservation Availability
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6 p-4 bg-black/50 border border-gray-800 rounded-xl">
        <div className="flex-1 flex flex-col md:flex-row gap-4 w-full">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full bg-black/70 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <select
              value={filterStatus}
              onChange={onFilterChange}
              className="w-full appearance-none bg-black/70 border border-gray-700 rounded-lg pl-10 pr-8 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-1 bg-black/70 border border-gray-700 rounded-lg flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'hover:bg-gray-700'}`}
              aria-label="Grid view"
            >
              <Grid size={20}/>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'hover:bg-gray-700'}`}
              aria-label="List view"
            >
              <List size={20}/>
            </button>
          </div>
          <Button
            disabled={isReadOnly}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2.5 px-4 rounded-lg"
            onClick={() => setShowAddModal(true)}
          >
            + Add Reservation
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-900 bg-red-900/30 text-red-300 px-4 py-3">{error}</div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && showSkeleton
            ? renderSkeletonGrid(size)
            : reservations.map(res => (
                <div
                  key={res.id}
                  className="bg-gradient-to-br from-black/60 to-gray-900/40 border border-gray-800 rounded-xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all duration-300"
                >
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full flex items-center justify-center border-2 border-blue-500/30">
                        <User size={28} className="text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{res.customerName}</h3>
                        <p className="text-sm text-gray-400 truncate">{res.customerEmail}</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm mb-6">
                      <p className="flex items-center gap-3">
                        <Phone size={16} className="text-gray-500" /> {res.customerPhone || 'N/A'}
                      </p>
                      <p className="flex items-center gap-3">
                        <CalendarDays size={16} className="text-gray-500" /> {res.reservationDate}, {res.reservationTime}
                      </p>
                    </div>
                    <div className="text-sm text-gray-300">
                      <p><span className="font-semibold">Guests:</span> {res.noOfPeople}</p>
                      {res.specialRequests && (
                        <p className="mt-2"><span className="font-semibold">Special Requests:</span> {res.remark}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusStyles(res.currentStatus)}`}>
                      {res.currentStatus}
                    </span>
                    <Button
                      onClick={() => setSelected(res)}
                      className="bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-colors duration-200 py-2 px-4 rounded-lg font-semibold"
                    >
                      <Eye size={16} className="mr-2" /> View
                    </Button>
                  </div>
                </div>
              ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-black/60">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-900/70">
                <tr>
                  {['Name', 'Email', 'Phone', 'Reservation Time', 'Status', 'Actions'].map(h => (
                    <th key={h} className="py-3.5 px-4 text-left font-semibold border-b border-gray-800">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {isLoading && showSkeleton ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="p-4">
                        <div className="h-64 bg-gray-700/50 rounded-lg animate-pulse"></div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reservations.map(res => (
                    <tr key={res.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 px-4 font-medium">{res.customerName}</td>
                      <td className="py-3 px-4 text-gray-400">{res.customerEmail}</td>
                      <td className="py-3 px-4 text-gray-300">{res.customerPhone}</td>
                      <td className="py-3 px-4 text-gray-300">
                        {res.reservationDate}, {res.reservationTime}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusStyles(res.currentStatus)}`}
                        >
                          {res.currentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          onClick={() => setSelected(res)}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State & Pagination */}
      {!isLoading && reservations.length === 0 ? (
        <div className="p-10 text-center text-gray-300">
          <h3 className="text-xl font-semibold text-white mb-2">No Reservations Found</h3>
          <p>Try changing filters or add a new reservation.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-6">
          <p className="text-sm text-gray-400">
            Showing {reservations.length} of {totalElements} reservations
          </p>
          <div className="flex items-center gap-1">
            <Button onClick={goFirst} disabled={!canGoPrev} className="bg-transparent border border-white/30 text-white hover:bg-blue-500 hover:text-white disabled:opacity-40">
              «
            </Button>
            <Button onClick={goPrev} disabled={!canGoPrev} className="bg-transparent border border-white/30 text-white hover:bg-blue-500 hover:text-white disabled:opacity-40">
              ‹
            </Button>
            {pageButtons.map((p, idx) => (
              <React.Fragment key={p}>
                {idx > 0 && p - pageButtons[idx - 1] > 1 && (
                  <span className="text-gray-500 px-1">…</span>
                )}
                <button
                  onClick={() => goTo(p)}
                  className={`px-4 py-2 rounded-md border text-sm ${
                    p === page
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-black/70 border-gray-700 hover:border-blue-500'
                  }`}
                >
                  {p + 1}
                </button>
              </React.Fragment>
            ))}
            <Button onClick={goNext} disabled={!canGoNext} className="bg-transparent border border-white/30 text-white hover:bg-blue-500 hover:text-white disabled:opacity-40">
              ›
            </Button>
            <Button onClick={goLast} disabled={!canGoNext} className="bg-transparent border border-white/30 text-white hover:bg-blue-500 hover:text-white disabled:opacity-40">
              »
            </Button>
          </div>
        </div>
      )}
      {showAddModal && <AddReservationModal onClose={() => setShowAddModal(false)} onSuccess={addModalSuccess} />}
      {selected && <ReservationDetailsModal reservation={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default ReservationManagementPage;

