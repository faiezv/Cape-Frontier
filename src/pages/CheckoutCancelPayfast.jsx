import React from 'react';
import { useNavigate } from 'react-router-dom';

const CheckoutCancelPayfast = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#eef7f6]">
      <div className="absolute inset-0 bg-white/80" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-amber-800">Payment cancelled</h1>
          <p className="mt-2 text-gray-600">You have cancelled the payment. No charges were made.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 rounded-full bg-[#071f4f] px-6 py-2 text-white"
          >
            Back to checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancelPayfast;