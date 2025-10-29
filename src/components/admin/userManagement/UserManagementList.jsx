import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../../../axios/instances/axiosInstances';
import { Button } from '../../ui/button';
import CommonLoadingSpinner from '../../loadingAnimations/CommonLoading';

// go to page no 224 to continue coding 

function UserManagementList() {
  const navigate = useNavigate();

  // Data
  const [userList, setUserList] = useState([]);
  const [error, setError] = useState(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true); // optional visual polish

  // Pagination (0-based for Spring)
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters/search
  const [filter, setFilter] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const {axiosAdminInstance} = useAxios();  
  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosAdminInstance.post('/users/fetch-list', {
        page,
        size,
        filter,      // OWNER | EMPLOYEE | CUSTOMER | ALL
        search: debouncedSearch || undefined, // ensure backend ignores when undefined
      });

      if (response.status === 200 && response.data) {
        const data = response.data;
        console.log('Fetched user list:', data);
        setUserList(data.content || []);
        setTotalPages(typeof data.totalPages === 'number' ? data.totalPages : 0);
        setTotalElements(typeof data.totalElements === 'number' ? data.totalElements : 0);
        if (typeof data.number === 'number') setPage(data.number);
        if (typeof data.size === 'number') setSize(data.size);
      }
      else if (response.status === 204) {
        setUserList([]);
        setTotalPages(0);
        setTotalElements(0);
        setPage(0);
        setSize(10);
        setError('No users found.');
      } 
      else {
        setError('Failed to fetch users list.');
      }
    } catch (err) {
      console.error('Error fetching users list:', err);
      setError(err?.response?.data?.message || 'An error occurred while fetching users.');
    } finally {
      setIsLoading(false);
      // optional: stop skeleton after first load
      setShowSkeleton(false);
    }
  }, [page, size, filter, debouncedSearch]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleViewDetails = (userEncryptionId) => {
    navigate(`/admin/users/detail/${userEncryptionId}`);
  };

  // Pagination helpers
  const canGoPrev = page > 0;
  const canGoNext = page < totalPages - 1;
  const goFirst = () => setPage(0);
  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));
  const goLast = () => setPage(Math.max(0, totalPages - 1));
  const goTo = (p) => setPage(p);

  const onPageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10) || 10;
    setSize(newSize);
    setPage(0);
  };

  const onFilterChange = (e) => {
    setFilter(e.target.value);
    setPage(0);
  };

  // Build compact pagination button set with ellipsis
  const pageButtons = useMemo(() => {
    const buttons = [];
    const maxButtons = 7;
    if (totalPages <= maxButtons) {
      for (let i = 0; i < totalPages; i++) buttons.push(i);
      return buttons;
    }
    const first = 0;
    const last = totalPages - 1;
    const start = Math.max(first + 1, page - 1);
    const end = Math.min(last - 1, page + 1);
    const middle = [];
    for (let i = start; i <= end; i++) middle.push(i);
    const set = new Set([first, ...middle, last]);
    // fill remaining slots around current
    let left = start - 1;
    let right = end + 1;
    while (set.size < maxButtons && (left > first || right < last)) {
      if (left > first) set.add(left--);
      if (set.size < maxButtons && right < last) set.add(right++);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [page, totalPages]);

  // Optional skeleton row rendering (visual polish)
  const renderSkeletonRows = (rows = Math.min(size, 8)) => {
    return Array.from({ length: rows }).map((_, i) => (
      <tr key={`sk-${i}`} className="border-b border-gray-800 animate-pulse">
        <td className="py-3 px-4">
          <div className="h-3 w-40 bg-gray-700 rounded" />
        </td>
        <td className="py-3 px-4">
          <div className="h-3 w-32 bg-gray-700 rounded" />
        </td>
        <td className="py-3 px-4">
          <div className="h-3 w-48 bg-gray-700 rounded" />
        </td>
        <td className="py-3 px-4">
          <div className="h-5 w-20 bg-gray-700 rounded-full" />
        </td>
        <td className="py-3 px-4">
          <div className="h-8 w-28 bg-gray-700 rounded" />
        </td>
      </tr>
    ));
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header bar */}
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Users List</h1>
          <p className="text-sm text-gray-400 mt-1">
            {totalElements} result{totalElements !== 1 ? 's' : ''} • Page {Math.min(page + 1, Math.max(totalPages, 1))} of {Math.max(totalPages, 1)}
          </p>
        </div>

        {/* Controls row */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm">Filter</label>
            <select
              value={filter}
              onChange={onFilterChange}
              className="bg-black/70 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:border-amber-500"
            > 
              <option value="ALL">All</option>
              <option value="OWNER">Owner</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="CUSTOMER">Customer</option>
            
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="bg-black/70 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:border-amber-500 placeholder-gray-500 min-w-[220px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm">Per page</label>
            <select
              value={size}
              onChange={onPageSizeChange}
              className="bg-black/70 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:border-amber-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-900 bg-red-900/30 text-red-300 px-4 py-3">
          {error}
        </div>
      )}

      {/* Table card */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-b from-black/70 to-black/60 backdrop-blur">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-900/70 text-white">
                <th className="py-3.5 px-4 text-left font-semibold border-b border-gray-800">Name</th>
                <th className="py-3.5 px-4 text-left font-semibold border-b border-gray-800">Email</th>
                <th className="py-3.5 px-4 text-left font-semibold border-b border-gray-800">Restaurant Name</th>
                <th className="py-3.5 px-4 text-left font-semibold border-b border-gray-800">Role</th> 
                <th className="py-3.5 px-4 text-left font-semibold border-b border-gray-800">Status</th>
                <th className="py-3.5 px-4 text-left font-semibold border-b border-gray-800">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading && showSkeleton
                ? renderSkeletonRows()
        // Editing has done till here        
                : userList.map((user, idx) => (
                    <tr
                      key={user.encryptedId}
                      className={`${idx % 2 === 0 ? 'bg-black/40' : 'bg-black/30'} text-white hover:bg-gray-800/50 transition-colors`}
                    >
                      <td className="py-3 px-4 font-medium">{user.name}</td>
                      <td className="py-3 px-4 text-gray-200">{user.email}</td>
                      <td className="py-3 px-4 text-gray-300">{user.restaurantName}</td>
                      <td className="py-3 px-4 text-gray-300">{user.role}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                            (user.status || 'PENDING') === 'ACTIVE'
                              ? 'bg-green-600/20 text-green-300 border-green-700/50'
                              : (user.status || 'PENDING') === 'NONACTIVE'
                              ? 'bg-red-600/20 text-gray-300 border-red-700/50'
                              : (user.status || 'PENDING') === 'DELETED'
                              ? 'bg-gray-600/20 text-red-300 border-gray-700/50'
                              : 'bg-amber-500/20 text-amber-300 border-amber-600/40'
                          }`}
                        >
                          {user.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          onClick={() => handleViewDetails(user.encryptedId)}
                          className="bg-amber-500 text-black font-semibold py-2 px-4 rounded-lg transition duration-200 hover:bg-amber-600 hover:text-white"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {!isLoading && userList.length === 0 && (
          <div className="p-10 text-center text-gray-300">No users found.</div>
        )}

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-t border-gray-800 px-4 py-3 bg-black/60">
          <div className="flex items-center gap-2">
            <Button
              onClick={goFirst}
              disabled={!canGoPrev}
              className="bg-transparent border border-white/30 text-white hover:bg-amber-500 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed"
            >
              « First
            </Button>
            <Button
              onClick={goPrev}
              disabled={!canGoPrev}
              className="bg-transparent border border-white/30 text-white hover:bg-amber-500 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ‹ Prev
            </Button>
          </div>

          <div className="flex items-center gap-1">
            {pageButtons.map((p, idx) => {
              const prev = pageButtons[idx - 1];
              const showEllipsis = idx > 0 && p - prev > 1;
              return (
                <React.Fragment key={p}>
                  {showEllipsis && <span className="text-gray-500 px-1 select-none">…</span>}
                  <button
                    onClick={() => goTo(p)}
                    className={`px-3 py-2 rounded-md border transition-colors ${
                      p === page
                        ? 'bg-amber-500 text-black border-amber-500'
                        : 'bg-black/70 text-white border-gray-700 hover:border-amber-500 hover:text-amber-300'
                    }`}
                  >
                    {p + 1}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={goNext}
              disabled={!canGoNext}
              className="bg-transparent border border-white/30 text-white hover:bg-amber-500 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next ›
            </Button>
            <Button
              onClick={goLast}
              disabled={!canGoNext}
              className="bg-transparent border border-white/30 text-white hover:bg-amber-500 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Last »
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagementList;
