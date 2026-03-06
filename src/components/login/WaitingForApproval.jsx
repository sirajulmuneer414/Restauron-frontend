import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LoginBack from '../../assets/login-back.jpg';

function WaitingForApproval() {
  const waitingForApprovalMessage = useSelector(
    (state) => state.specialValues.waitingForApprovalMessage
  );
  const navigate = useNavigate();

  return (
    <div
      className="w-full h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${LoginBack})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Card */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-10 py-12 rounded-3xl max-w-md w-full mx-4"
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 8px 48px 0 rgba(0,0,0,0.45)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Animated clock icon */}
        <div className="mb-6 flex items-center justify-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
              boxShadow: '0 0 32px rgba(245,158,11,0.45)',
              animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-3xl font-extrabold text-white mb-3 tracking-tight"
          style={{ letterSpacing: '-0.5px' }}
        >
          Pending Approval
        </h1>

        {/* Divider */}
        <div
          className="w-12 h-1 rounded-full mb-5"
          style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }}
        />

        {/* Message */}
        <p className="text-base text-white/80 mb-3 leading-relaxed">
          {waitingForApprovalMessage ||
            'Your account is currently under review by our team.'}
        </p>
        <p className="text-sm text-white/55 mb-8 leading-relaxed">
          You will receive an email notification once your account is approved.
          This typically takes 1–2 business days.
        </p>

        {/* Status badge */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8"
          style={{
            background: 'rgba(245,158,11,0.18)',
            border: '1px solid rgba(245,158,11,0.4)',
            color: '#fbbf24',
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: '#fbbf24',
              animation: 'pulse 1.5s infinite',
            }}
          />
          Status: Under Review
        </div>

        {/* Back to Login button */}
        <button
          onClick={() => navigate('/login')}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(245,158,11,0.35)',
            letterSpacing: '0.3px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 28px rgba(245,158,11,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(245,158,11,0.35)';
          }}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

export default WaitingForApproval;