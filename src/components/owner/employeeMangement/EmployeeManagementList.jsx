import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, CreditCard, Eye, Search, Filter, List, Grid } from 'lucide-react';
import { useAxios } from '../../../axios/instances/axiosInstances';
import { Button } from '../../ui/button';

function EmployeeManagementList() {
  const navigate = useNavigate();
  const {axiosOwnerInstance} = useAxios(); // Assuming an owner-specific instance
  // Data
  const [employeeList, setEmployeeList] = useState([]);
  const [error, setError] = useState(null);

  // UI & Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Pagination (0-based for Spring)
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(6); // Adjusted for a 3-column grid view
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters/search
  const [filter, setFilter] = useState('ALL'); // Default to all statuses
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0); // Reset to first page on new search
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch employee data from the backend
  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // NOTE: Updated endpoint for fetching employees from an owner's perspective
      const response = await axiosOwnerInstance.post('/employees/fetch-list', {
        page,
        size,
        filter, // e.g., 'ACTIVE', 'INACTIVE', 'ALL'
        search: debouncedSearch || undefined,
      });

      if (response.status === 200 && response.data) {
        const data = response.data;
        setEmployeeList(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
        setPage(data.number || 0);
        setSize(data.size || 6);
      } else if (response.status === 204) {
        setEmployeeList([]);
        setTotalPages(0);
        setTotalElements(0);
      } else {
        setError('Failed to fetch employee list.');
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err?.response?.data?.message || 'An error occurred while fetching the employee list.');
    } finally {
      setIsLoading(false);
      setShowSkeleton(false);
    }
  }, [page, size, filter, debouncedSearch]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleViewDetails = (encryptedId) => {
    navigate(`/owner/employees/detail/${encryptedId}`);
  };
  const onAddEmployeeButtonClick = () => {
    navigate('/owner/employees/add');
  }
  
    // --- Pagination Logic (same as your original component) ---
    const canGoPrev = page > 0;
    const canGoNext = page < totalPages - 1;
    const goFirst = () => setPage(0);
    const goPrev = () => setPage((p) => Math.max(0, p - 1));
    const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));
    const goLast = () => setPage(Math.max(0, totalPages - 1));
    const goTo = (p) => setPage(p);
  
    const onPageSizeChange = (e) => {
      const newSize = parseInt(e.target.value, 10) || 6;
      setSize(newSize);
      setPage(0);
    };
  
    const onFilterChange = (e) => {
      setFilter(e.target.value);
      setPage(0);
    };
  
    const pageButtons = useMemo(() => {
        const buttons = [];
        const maxButtons = 5;
        if (totalPages <= maxButtons) {
          for (let i = 0; i < totalPages; i++) buttons.push(i);
          return buttons;
        }
        const first = 0;
        const last = totalPages - 1;
        const start = Math.max(first + 1, page - 2);
        const end = Math.min(last - 1, page + 2);
        const set = new Set([first]);
        for (let i = start; i <= end; i++) set.add(i);
        set.add(last);
        return Array.from(set).sort((a,b) => a-b);
    }, [page, totalPages]);
  
    const getStatusStyles = (status) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-500/20 text-green-300 border-green-600/50';
            case 'INACTIVE': return 'bg-red-500/20 text-red-300 border-red-600/50';
            case 'PENDING': return 'bg-yellow-500/20 text-yellow-300 border-yellow-600/50';
            default: return 'bg-gray-500/20 text-gray-300 border-gray-600/50';
        }
    }

  const renderSkeletonGrid = (count = 6) => (
    Array.from({ length: count }).map((_, i) => (
        <div key={`sk-grid-${i}`} className="bg-black/40 border border-gray-800 rounded-xl p-6 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
            </div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-10 bg-gray-700 rounded-lg mt-4"></div>
            </div>
        </div>
    ))
  );

  return (
    <div className="container mx-auto p-4 text-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <p className="text-gray-400">View, search, and manage your restaurant staff.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6 p-4 bg-black/50 border border-gray-800 rounded-xl">
        <div className="flex-1 flex flex-col md:flex-row gap-4 w-full">
            <div className="relative w-full md:w-auto md:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email, or phone..."
                    className="w-full bg-black/70 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30"
                />
            </div>
            <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <select
                    value={filter}
                    onChange={onFilterChange}
                    className="w-full appearance-none bg-black/70 border border-gray-700 rounded-lg pl-10 pr-8 py-2.5 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30"
                >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="PENDING">Pending</option>
                </select>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="p-1 bg-black/70 border border-gray-700 rounded-lg flex">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-yellow-500 text-black' : 'hover:bg-gray-700'}`}><Grid size={20}/></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-yellow-500 text-black' : 'hover:bg-gray-700'}`}><List size={20}/></button>
            </div>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2.5 px-4 rounded-lg" onClick = {() => onAddEmployeeButtonClick()}>
                + Add Employee
            </Button>
        </div>
      </div>

        {error && <div className="mb-4 rounded-lg border border-red-900 bg-red-900/30 text-red-300 px-4 py-3">{error}</div>}

        {/* Dynamic View: Grid or List */}
        {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading && showSkeleton ? renderSkeletonGrid(size) : employeeList.map(emp => (
                    <div key={emp.encryptedId} className="bg-gradient-to-br from-black/60 to-gray-900/40 border border-gray-800 rounded-xl p-6 flex flex-col justify-between hover:border-yellow-500/30 transition-all duration-300">
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-full flex items-center justify-center border-2 border-yellow-500/30">
                                    <User size={28} className="text-yellow-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{emp.name}</h3>
                                    <p className="text-sm text-gray-400 truncate">{emp.email}</p>
                                </div>
                            </div>
                            <div className="space-y-3 text-sm mb-6">
                                <p className="flex items-center gap-3"><Phone size={16} className="text-gray-500" /> {emp.phone || 'N/A'}</p>
                                <p className="flex items-center gap-3"><CreditCard size={16} className="text-gray-500" /> {emp.adhaarNo ? `**** **** ${emp.adhaarNo.slice(-4)}` : 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusStyles(emp.status)}`}>{emp.status}</span>
                            <Button onClick={() => handleViewDetails(emp.encryptedId)} className="bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 hover:bg-yellow-500 hover:text-black transition-colors duration-200 py-2 px-4 rounded-lg font-semibold">
                                <Eye size={16} className="mr-2" /> View
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            // List View
            <div className="overflow-hidden rounded-xl border border-gray-800 bg-black/60">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-900/70"><tr>
                            {['Employee', 'Contact', 'Aadhaar No.', 'Status', 'Actions'].map(h => <th key={h} className="py-3.5 px-4 text-left font-semibold border-b border-gray-800">{h}</th>)}
                        </tr></thead>
                        <tbody className="divide-y divide-gray-800">
                            {isLoading && showSkeleton ? <tr><td colSpan={5}><div className="p-4"><div className="h-64 bg-gray-700/50 rounded-lg animate-pulse"></div></div></td></tr> : employeeList.map(emp => (
                                <tr key={emp.encryptedId} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="font-medium">{emp.name}</div>
                                        <div className="text-gray-400">{emp.email}</div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-300">{emp.phone}</td>
                                    <td className="py-3 px-4 text-gray-300 font-mono">{emp.adhaarNo ? `**** **** ${emp.adhaarNo.slice(-4)}` : 'N/A'}</td>
                                    <td className="py-3 px-4"><span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusStyles(emp.status)}`}>{emp.status}</span></td>
                                    <td className="py-3 px-4"><Button onClick={() => handleViewDetails(emp.encryptedId)} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg">View</Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

      {/* Empty State and Pagination */}
      {!isLoading && employeeList.length === 0 ? (
        <div className="p-10 text-center text-gray-300">
            <h3 className="text-xl font-semibold text-white mb-2">No Employees Found</h3>
            <p>Try adjusting your filters or add a new employee.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-6">
            <p className="text-sm text-gray-400">Showing {employeeList.length} of {totalElements} employees</p>
            <div className="flex items-center gap-1">
                <Button onClick={goFirst} disabled={!canGoPrev} className="bg-transparent border border-white/30 text-white hover:bg-amber-500 hover:text-black disabled:opacity-40">«</Button>
                <Button onClick={goPrev} disabled={!canGoPrev} className="bg-transparent border border-white/30 text-white hover:bg-amber-500 hover:text-black disabled:opacity-40">‹</Button>
                {pageButtons.map((p, idx) => (
                    <React.Fragment key={p}>
                        {idx > 0 && p - pageButtons[idx-1] > 1 && <span className="text-gray-500 px-1">…</span>}
                        <button onClick={() => goTo(p)} className={`px-4 py-2 rounded-md border text-sm ${p === page ? 'bg-amber-500 text-black border-amber-500' : 'bg-black/70 border-gray-700 hover:border-amber-500'}`}>{p + 1}</button>
                    </React.Fragment>
                ))}
                <Button onClick={goNext} disabled={!canGoNext} className="bg-transparent border border-white/30 text-white hover:bg-amber-500 hover:text-black disabled:opacity-40">›</Button>
                <Button onClick={goLast} disabled={!canGoNext} className="bg-transparent border border-white/30 text-white hover:bg-amber-500 hover:text-black disabled:opacity-40">»</Button>
            </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeManagementList;
