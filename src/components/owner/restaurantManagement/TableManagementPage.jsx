import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { axiosOwnerInstance } from '../../../axios/instances/axiosInstances';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../../ui/button';
import { Trash2, QrCode, Link as LinkIcon, Check, Users } from 'lucide-react';
import CommonLoadingSpinner from '../../loadingAnimations/CommonLoading';
import Cookie from 'js-cookie';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

// --- Single Table Card Component with Print + Copy URL + Capacity ---
const TableCard = ({ table, restaurantEncryptedId, onDelete }) => {
  const printRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const customerUrl = `${window.location.origin}/restaurant/${restaurantEncryptedId}/table/${table.encryptedId}`;
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `QR_Code_Table_${table.name.replace(/\s+/g, '_')}`,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(customerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
        toast.error('Failed to copy URL. Please copy manually.' + (err.response?.data?.message || ''));
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-lg p-4 flex flex-col items-center gap-4">
      {/* Printable Area */}
      <div ref={printRef} className="p-4 bg-white rounded-lg flex flex-col items-center gap-2 text-black w-full">
        <h3 className="text-xl font-bold">{table.name}</h3>
        
        {/* Capacity Display in Card */}
        <div className="flex items-center gap-1 text-gray-600 text-sm font-medium mb-1">
            <Users size={14} />
            <span>{table.capacity || 4} Seats</span>
        </div>

        <QRCodeSVG value={customerUrl} size={180} level="H" includeMargin />
        
        <p className="text-xs text-gray-600 max-w-[180px] text-center mt-1">
          Scan to view menu & order
        </p>
      </div>

      {/* --- Action Buttons --- */}
      <div className="w-full flex flex-col gap-2 mt-2">
        {/* Top row for Delete and Print */}
        <div className="w-full grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => onDelete(table.encryptedId)}
              className="text-red-400 border-red-500/30 hover:bg-red-900 flex-1"
            >
              <Trash2 size={16} />
            </Button>
            <Button onClick={handlePrint} className="bg-amber-500 hover:bg-amber-600 text-black flex-1">
              <QrCode size={16} className="mr-2" /> Print
            </Button>
        </div>
        
        {/* Bottom row for Copy URL */}
        <Button onClick={handleCopy} className="bg-gray-700 hover:bg-gray-600 text-white w-full">
          {copied ? <Check size={16} className="mr-2 text-green-400" /> : <LinkIcon size={16} className="mr-2" />}
          {copied ? 'Copied!' : 'Copy URL'}
        </Button>
      </div>

      <p className="text-[10px] text-gray-500 mt-1 break-all text-center px-2">
        {customerUrl}
      </p>
    </div>
  );
};


// --- Main Table Management Page ---
const TableManagementPage = () => {
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [newTableName, setNewTableName] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(4); // Default to 4
  
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const user = useSelector((state) => state.userSlice.user);
  const isReadOnly = user?.restaurantAccessLevel === 'READ_ONLY';
  const restaurantEncryptedId = Cookie.get('restaurantId');

  const fetchTables = useCallback(async () => {
    if (!restaurantEncryptedId) {
      setError('Restaurant information not found. Please log in again.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axiosOwnerInstance.get('/tables/list');
      setTables(response.data || []);
    } catch (err) {
      setError('Failed to fetch tables.'+ (err.response?.data?.message || ''));
    } finally {
      setIsLoading(false);
    }
  }, [restaurantEncryptedId]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleCreateTable = async (e) => {
    if (isReadOnly) {
      toast.error("Cannot create table in Read-Only mode.");
      return;
    }
    e.preventDefault();
    
    if (!newTableName.trim()){
      setError('Table name cannot be empty.');
      inputRef.current.focus();
      return;
    } 

    if (newTableCapacity < 1){
        setError('Capacity must be at least 1.');
        return;
    }

    try {
      // Sending capacity in the POST request
      await axiosOwnerInstance.post('/tables/create', { 
          name: newTableName.trim(),
          capacity: parseInt(newTableCapacity)
      });
      
      // Reset Form
      setNewTableName('');
      setNewTableCapacity(4);
      setError(null);
      fetchTables();
      toast.success("Table created successfully");
    } catch (err) {
      setError('Failed to create table.'+ (err.response?.data?.message || ''));
    }
  };

  const handleDeleteTable = async (tableEncryptedId) => {
    if (isReadOnly) {
      toast.error("Cannot delete table in Read-Only mode.");
      return;
    }
    if (!globalThis.confirm('Are you sure you want to delete this table?')) return;
    try {
      await axiosOwnerInstance.delete(`/tables/delete/${tableEncryptedId}`);
      toast.success("Table deleted");
      fetchTables();
    } catch (err) {
      setError('Failed to delete table.'+ (err.response?.data?.message || ''));
    }
  };

  if (!restaurantEncryptedId) {
    return (
      <div className="container mx-auto p-4 text-center text-red-400">
        <h2 className="text-xl font-bold">Error</h2>
        <p>Could not find restaurant identifier. Please try logging out and back in.</p>
      </div>
    );
  }

  if (isLoading) return <CommonLoadingSpinner />;

  return (
    <div className="container mx-auto p-4 text-white bg-linear-to-b from-black/60 to-gray-500 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Table Management</h1>

      {/* Create Table Form */}
      <div className="mb-8 p-6 bg-gray-900/50 rounded-xl border border-gray-700 shadow-sm max-w-2xl">
        <h2 className="text-lg font-semibold mb-4 text-gray-200">Add New Table</h2>
        <form onSubmit={handleCreateTable} className="flex flex-col sm:flex-row gap-4 items-end">
          
          {/* Table Name Input */}
          <div className="flex-1 w-full space-y-2">
            <label className="text-sm text-gray-400">Table Name / Number</label>
            <input
                ref={inputRef}
                type="text"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                placeholder="e.g. Table 5"
                className="w-full bg-black/70 border border-gray-600 rounded-md p-2.5 focus:outline-none focus:border-amber-500 text-white"
            />
          </div>

          {/* Capacity Input */}
          <div className="w-full sm:w-32 space-y-2">
            <label className="text-sm text-gray-400">Capacity</label>
            <div className="relative">
                <input
                    type="number"
                    min="1"
                    max="50"
                    value={newTableCapacity}
                    onChange={(e) => setNewTableCapacity(e.target.value)}
                    className="w-full bg-black/70 border border-gray-600 rounded-md p-2.5 pl-8 focus:outline-none focus:border-amber-500 text-white"
                />
                <Users className="absolute left-2.5 top-3 text-gray-500" size={14} />
            </div>
          </div>

          <Button type="submit" className="bg-green-600 hover:bg-green-700 h-[42px] px-6 w-full sm:w-auto">
             Create
          </Button>
        </form>
        {error && <p className="text-red-400 mt-3 text-sm flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-400 rounded-full" /> {error}</p>}
      </div>

      {/* Table Grid */}
      {tables.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((table) => (
            <TableCard
              key={table.encryptedId}
              table={table}
              restaurantEncryptedId={restaurantEncryptedId}
              onDelete={handleDeleteTable}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 p-12 border border-dashed border-gray-700 rounded-xl bg-gray-900/30">
          <Users size={48} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-300">No tables found</h3>
          <p className="text-sm mt-1">Use the form above to add your first table and generate QR codes.</p>
        </div>
      )}
    </div>
  );
};

export default TableManagementPage;

