import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { axiosOwnerInstance } from '../../../axios/instances/axiosInstances';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../../ui/button';
import { Plus, Trash2, QrCode, Link as LinkIcon, Check } from 'lucide-react';
import CommonLoadingSpinner from '../../loadingAnimations/CommonLoading';
import Cookie from 'js-cookie';

 // Assuming an owner-specific instance

// --- Single Table Card Component with Print + Copy URL ---
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
        alert('Failed to copy URL. Please copy manually.');
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-lg p-4 flex flex-col items-center gap-4">
      <div ref={printRef} className="p-4 bg-white rounded-lg flex flex-col items-center gap-2 text-black">
        <h3 className="text-xl font-bold">{table.name}</h3>
        <QRCodeSVG value={customerUrl} size={180} level="H" includeMargin />
        <p className="text-xs text-gray-600 max-w-[180px] text-center">
          Scan to view menu & order
        </p>
      </div>

      {/* --- Corrected Button Layout --- */}
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
              <QrCode size={16} className="mr-2" /> Print QR
            </Button>
        </div>
        
        {/* Bottom row for Copy URL */}
        <Button onClick={handleCopy} className="bg-gray-700 hover:bg-gray-600 text-white w-full">
          {copied ? <Check size={16} className="mr-2 text-green-400" /> : <LinkIcon size={16} className="mr-2" />}
          {copied ? 'Copied!' : 'Copy URL'}
        </Button>
      </div>

      <p className="text-xs text-gray-400 mt-1 break-all text-center">{customerUrl}</p>
    </div>
  );
};


// --- Main Table Management Page ---
const TableManagementPage = () => {
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTableName, setNewTableName] = useState('');
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Fetch restaurantEncryptedId from cookies

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
      setError('Failed to fetch tables.');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantEncryptedId]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleCreateTable = async (e) => {
    e.preventDefault();
    if (!newTableName.trim()){
      setError('Table name cannot be empty.');
      inputRef.current.focus();
      return;
      
    } 
    try {
      await axiosOwnerInstance.post('/tables/create', { name: newTableName.trim() });
      setNewTableName('');
      fetchTables();
    } catch (err) {
      setError('Failed to create table.');
    }
  };

  const handleDeleteTable = async (tableEncryptedId) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    try {
      await axiosOwnerInstance.delete(`/tables/delete/${tableEncryptedId}`);
      fetchTables();
    } catch (err) {
      setError('Failed to delete table.');
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
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">Table Management</h1>

      <div className="mb-8 max-w-md">
        <form onSubmit={handleCreateTable} className="flex items-center gap-4">
          <input
            ref={inputRef}
            type="text"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            placeholder="e.g., Patio Table 5, Booth 2"
            className="w-full bg-black/70 border border-gray-700 rounded-md p-2 focus:outline-none focus:border-amber-500"
          />
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
             Create Table
          </Button>
        </form>
        {error && <p className="text-red-400 mt-2">{error}</p>}
      </div>

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
        <div className="text-center text-gray-400 p-10 border border-dashed border-gray-700 rounded-lg">
          <p>No tables have been created yet. Use the form above to add your first table.</p>
        </div>
      )}
    </div>
  );
};

export default TableManagementPage;

