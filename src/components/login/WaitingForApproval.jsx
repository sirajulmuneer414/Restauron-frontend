import React from 'react'
import { useSelector } from 'react-redux';
import LoginBack from'../../assets/login-back.jpg'

function WaitingForApproval() {
    const waitingForApprovalMessage = useSelector((state) => state.specialValues.waitingForApprovalMessage);

  return (
    <>
    <div className="background w-full h-screen flex items-center justify-center" style={ {backgroundImage: `url(${LoginBack})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="contentArea">
            <div className="flex flex-col items-center justify-center text-white backdrop-grayscale">
                <h1 className="text-2xl font-bold mb-4">Waiting for Approval</h1>
                <p className="text-lg text-white mb-6">{waitingForApprovalMessage}.</p>
                <p className="text-sm text-white">You will receive an email notification once your account is approved.</p>
            </div>
        </div>

    </div>
    </>
  )
}

export default WaitingForApproval;