'use client';

import { useSearchParams } from 'next/navigation';
import CarForm from '../../../components/CarForm';
import { useEffect, useState } from 'react';

export default function EditCarPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const [neptunCode, setNeptunCode] = useState<string>('');
  
  useEffect(() => {
    const neptun = searchParams.get('neptun');
    if (neptun) {
      setNeptunCode(neptun);
    }
  }, [searchParams]);

  if (!neptunCode) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-red-500">Neptun code is missing</p>
            <a href="/" className="text-blue-500 hover:underline block mt-4">
              Go to Home Page
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Edit Car</h1>
        <CarForm neptunCode={neptunCode} carId={params.id} />
      </div>
    </div>
  );
} 