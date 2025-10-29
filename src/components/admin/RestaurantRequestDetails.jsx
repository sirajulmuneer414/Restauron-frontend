import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAxios } from '../../axios/instances/axiosInstances';
import { Button } from '../ui/button';
import CommonLoadingSpinner from '../loadingAnimations/CommonLoading';

function RestaurantRequestDetails() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isApproveBtnPressed, setIsApproveBtnPressed] = useState(false);
  const [isRejectBtnPressed, setIsRejectBtnPressed] = useState(false);
  const [isPendingBtnPressed, setIsPendingBtnPressed] = useState(false);
  const dialogRef = useRef(null);
const { axiosAdminInstance} = useAxios();
  const fetchRequestDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      // This uses the new backend endpoint we suggested
      const response = await axiosAdminInstance.get(`/restaurant/request/${requestId}`);
      if (response.status === 200) {
        setDetails(response.data);
      } else {
        setError('Failed to fetch request details.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching details.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchRequestDetails();
  }, [fetchRequestDetails]);

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);

    switch (newStatus) {
      case 'APPROVED':
        setIsApproveBtnPressed(true);
        break;
      case 'REJECTED':
        setIsRejectBtnPressed(true);
        break;
      case 'PENDING':
        setIsPendingBtnPressed(true);
        break;
      default:
        break;
    }
    try {
      const params = new URLSearchParams();
      params.append('restaurantId', requestId);
      params.append('statusUpdateTo', newStatus);

      // Using the /status-update endpoint you provided
      const response = await axiosAdminInstance.post('/restaurant/status-update', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.status === 200 && response.data === true) {
        console.log(`Status updated to ${newStatus} successfully.`);
        // Update status locally for immediate feedback
        setDetails(prev => ({ ...prev, status: newStatus }));
        // Optionally navigate back to the list after a delay
        setTimeout(() => navigate('/admin/restaurant/requests'), 1500);
      } else {
        setError('Failed to update status.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setIsUpdating(false);
      setIsApproveBtnPressed(false);
      setIsRejectBtnPressed(false);
      setIsPendingBtnPressed(false);
    }
  };

  if (isLoading) return <CommonLoadingSpinner />;
  if (error && !details) return <p className="text-red-500 text-center text-xl">{error}</p>;
  if (!details) return <p className="text-white text-center text-xl">No details found for this request.</p>;

  return (
    <div className="container mx-auto p-4 text-white">
      <dialog ref={dialogRef} onClick={(e) => {
        if (e.target === dialogRef.current) {
          dialogRef.current.close();
        }
      }}>
        <h2>Image go here</h2>

      </dialog>

      <h1 className="text-3xl font-bold mb-6">Restaurant Application: <span className="text-amber-500">{details.restaurantName}</span></h1>

      {error && <p className="text-red-500 mb-4 bg-red-900/50 p-3 rounded-lg">{error}</p>}

      <div className="bg-black/70 backdrop-blur-lg rounded-lg shadow-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1: Restaurant & Owner Info */}
          <div className="space-y-4">
            <div><h3 className="text-xl font-semibold text-amber-500 border-b border-amber-500/50 pb-2 mb-2">Owner Information</h3></div>
            <p><strong className="w-32 inline-block">Owner Name:</strong> {details.ownerName}</p>
            <p><strong className="w-32 inline-block">Owner Email:</strong> {details.ownerEmail}</p>
            <p><strong className="w-32 inline-block">Owner Phone:</strong> {details.ownerPhone || 'N/A'}</p>
            <p><strong className="w-32 inline-block">Aadhaar No:</strong> {details.ownerAdhaarNo}</p>

            <div className="mt-6">
              <h3 className="text-xl font-semibold text-amber-500 border-b border-amber-500/50 pb-2 mb-2">Restaurant Information</h3>
            </div>
            <p><strong className="w-32 inline-block">Restaurant Phone:</strong> {details.restaurantPhone}</p>
            <p><strong className="w-32 inline-block">Restaurant Email:</strong> {details.restaurantEmail || 'N/A'}</p>
            <p><strong className="w-32 inline-block">Address:</strong> {details.restaurantAddress}, {details.district}, {details.state} - {details.pincode}</p>
            <p><strong className="w-32 inline-block">Otp Status:</strong>
              <span className={`ml-2 px-3 py-1 text-sm font-semibold rounded-full ${details.otpStatus === 'VERIFIED' ? 'bg-green-500 text-white' :
                details.otpStatus === 'UNVERIFIED' ? 'bg-red-500 text-white' :
                  'bg-yellow-500 text-black'}`
              }>
                {details.otpStatus}
              </span>
            </p>
            <p><strong className="w-32 inline-block">Current Status:</strong>
              <span className={`ml-2 px-3 py-1 text-sm font-semibold rounded-full ${details.status === 'APPROVED' ? 'bg-green-500 text-white' :
                details.status === 'REJECTED' ? 'bg-red-500 text-white' :
                  'bg-yellow-500 text-black'}`
              }>
                {details.status}
              </span>
            </p>
          </div>

          {/* Column 2: Aadhaar Image */}
          <div>
            <h3 className="text-xl font-semibold text-amber-500 border-b border-amber-500/50 pb-2 mb-4">Aadhaar Verification</h3>
            {details.ownerAdhaarPhoto ? (
              // <a href={details.ownerAdhaarPhoto} target="_blank" rel="noopener noreferrer">
              <div>
                <button onClick={() => dialogRef.current.showModal()} className="w-full">
                  <img
                    src={details.ownerAdhaarPhoto}
                    style={{ maxHeight: '400px', width: '400px' }}
                    alt="Aadhaar Card"
                    className="rounded-lg shadow-lg w-full max-w-md object-cover transition-transform duration-300 hover:scale-105"
                  />
                </button>
              </div>

            ) : (
              <div className="h-64 bg-gray-800 flex items-center justify-center rounded-lg">
                <p className="text-gray-400">No image uploaded.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-700/50 flex justify-end items-center space-x-4">
          <h3 className="text-lg font-semibold mr-auto">Take Action</h3>
          <Button
            onClick={() => handleStatusUpdate('REJECTED')}
            disabled={isUpdating || details.status === 'REJECTED' || isRejectBtnPressed}
            className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRejectBtnPressed ? 'Rejecting' : isUpdating ? 'Updating...' : 'Reject'}
          </Button>
          <Button
            onClick={() => handleStatusUpdate('PENDING')}
            disabled={isUpdating || details.status === 'PENDING'}
            className="bg-gray-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPendingBtnPressed ? 'Pending pressed..' : isUpdating ? 'Updating...' : 'Set to Pending'}
          </Button>
          <Button
            onClick={() => handleStatusUpdate('APPROVED')}
            disabled={isApproveBtnPressed || details.status === 'APPROVED'}
            className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isApproveBtnPressed ? 'Approving...' : isUpdating ? 'Updating' : 'Approve'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RestaurantRequestDetails;
