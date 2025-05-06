'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CarList from './components/CarList';

export default function Home() {
  const searchParams = useSearchParams();
  const [neptunCode, setNeptunCode] = useState<string>(searchParams.get('neptun') || '');
  const [submittedNeptun, setSubmittedNeptun] = useState<string>(searchParams.get('neptun') || '');

  useEffect(() => {
    const neptun = searchParams.get('neptun');
    if (neptun) {
      setNeptunCode(neptun);
      setSubmittedNeptun(neptun);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedNeptun(neptunCode);
    // Update URL with the Neptun code
    window.history.pushState({}, '', `/?neptun=${neptunCode}`);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        
        <div className="bg-white p-6 rounded-lg shadow-[0_5px_0_0_#e5e7eb] mb-8">
          <h2 className="text-xl font-semibold mb-4">Enter Your Neptun Code</h2>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={neptunCode}
              onChange={(e) => setNeptunCode(e.target.value)}
              placeholder="Enter Neptun code (e.g., ABC123)"
              className="flex-1 p-2 border border-gray-300 rounded shadow-[0_4px_0_0_#d1d5db] focus:outline-none focus:border-blue-500"
              required
            />
            <button 
              type="submit"
              className="bg-[#FFC1DA] hover:bg-[#FF90BB] text-white px-4 py-2 rounded shadow-[0_4px_0_0_#FF90BB] hover:shadow-[0_2px_0_0_#FF90BB] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all"
            >
              Submit
            </button>
          </form>
        </div>

        {submittedNeptun ? (
          <CarList neptunCode={submittedNeptun} />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-[0_5px_0_0_#e5e7eb] text-center">
            <p className="text-gray-600">Please enter your Neptun code to view and manage cars.</p>
          </div>
        )}
      </div>
    </div>
  );
}
