import React, { useState, useEffect } from 'react';

import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAxios } from '../../../axios/instances/axiosInstances';
import { useEmployeeService } from '../../../services/employeeService';

const EmployeeMenuPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { axiosEmployeeInstance } = useAxios();
  const employeeService = useEmployeeService();
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [categoryList, setCategoryList] = useState([]);

    // Fetch Categories on Mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories = await employeeService.getAllCategories();
                setCategoryList(categories);
            } catch (error) {
                toast.error("Failed to load categories"+(error?.response?.data?.message || ""));
            }   
        };
        fetchCategories();
    }, [0]);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMenu();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, category, page]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const response = await axiosEmployeeInstance.get('/menu/search', {
        params: {
          query: searchQuery,
          category: category.name || 'All',
          page: page,
          size: 12
        }
      });
      setItems(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error("Failed to load menu"+(error?.response?.data?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Restaurant Menu</h1>
        
        <div className="flex gap-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Category Filter */}
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="All">All Categories</option>
            {categoryList.map(cat => (
              <option key={cat.encryptedCategoryId} value={cat}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading menu...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                <div className="h-48 bg-gray-200">
                  <img src={item.imageUrl || "https://placehold.co/400x300"} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    <span className="font-bold text-indigo-600">₹{item.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{item.description}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.available ? 'Available' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8 gap-2">
            <button 
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 py-2 text-gray-600">Page {page + 1} of {totalPages}</span>
            <button 
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeMenuPage;
