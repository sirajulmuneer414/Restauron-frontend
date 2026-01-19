import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, ExternalLink, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const RestaurantQRCodeCard = ({ restaurantLink }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(restaurantLink.customerPageUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('restaurant-qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `${restaurantLink.restaurantName}-QR-Code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      
      toast.success('QR Code downloaded!');
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
          <ExternalLink size={20} />
        </div>
        <h2 className="text-lg font-bold text-gray-800">Customer Landing Page</h2>
      </div>

      {/* QR Code Display */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mb-4 flex justify-center">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <QRCodeSVG
            id="restaurant-qr-code"
            value={restaurantLink.customerPageUrl}
            size={180}
            level="H"
            includeMargin={true}
          />
        </div>
      </div>

      {/* Restaurant Name */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-500 mb-1">Scan to view menu</p>
        <p className="font-bold text-gray-900">{restaurantLink.restaurantName}</p>
      </div>

      {/* Link Display */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center gap-2 border border-gray-200">
        <input
          type="text"
          value={restaurantLink.customerPageUrl}
          readOnly
          className="flex-1 bg-transparent text-xs text-gray-600 outline-none truncate"
        />
        <button
          onClick={handleCopyLink}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
          title="Copy link"
        >
          {copied ? (
            <Check size={16} className="text-green-600" />
          ) : (
            <Copy size={16} className="text-gray-600" />
          )}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleDownloadQR}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-colors"
        >
          <Download size={16} />
          Download QR
        </button>
        <a
          href={restaurantLink.customerPageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold text-sm transition-colors"
        >
          <ExternalLink size={16} />
          Open Page
        </a>
      </div>

      {/* Info Text */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Share this QR code or link with your customers to let them browse your menu and place orders
        </p>
      </div>
    </div>
  );
};

export default RestaurantQRCodeCard;
