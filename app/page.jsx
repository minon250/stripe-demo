// PreviewPage.jsx
"use client";

import { useEffect, useState } from 'react';

export default function PreviewPage() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      setMessage('Order placed! You will receive an email confirmation.');
    }
    if (query.get('canceled')) {
      setMessage("Order canceled -- continue to shop around and checkout when you're ready.");
    }
  }, []);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {message && (
        <div className="message">
          {message}
        </div>
      )}
      <form onSubmit={handleCheckout}>
        <section>
          <button 
            type="submit" 
            disabled={isLoading}
            className={isLoading ? 'loading' : ''}
          >
            {isLoading ? 'Loading...' : 'Checkout'}
          </button>
        </section>
      </form>
      <style jsx>
        {`
          section {
            background: #ffffff;
            display: flex;
            flex-direction: column;
            width: 400px;
            height: 112px;
            border-radius: 6px;
            justify-content: space-between;
          }
          button {
            height: 36px;
            background: #556cd6;
            border-radius: 4px;
            color: white;
            border: 0;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0px 4px 5.5px 0px rgba(0, 0, 0, 0.07);
          }
          button:hover {
            opacity: 0.8;
          }
          button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          button.loading {
            background: #94a3e5;
          }
          .message {
            color: #0f172a;
            padding: 12px;
            margin-bottom: 16px;
            border-radius: 4px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
          }
        `}
      </style>
    </>
  );
}