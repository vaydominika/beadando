'use client';

import { useState, useEffect } from 'react';
import { carService } from '../services/carService';
import { Car } from '../types/car';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConfirmationModal from './ConfirmationModal';
import Button from './Button';

interface CarDetailProps {
  carId: string;
  neptunCode: string;
  isInModal?: boolean;
  onCarDeleted?: () => void;
}

export default function CarDetail({ carId, neptunCode, isInModal = false, onCarDeleted }: CarDetailProps) {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await carService.getCarById(neptunCode, carId);
        setCar(data);
      } catch (err) {
        console.error('Failed to fetch car:', err);
        setError(err instanceof Error ? err.message : 'Failed to load car details');
      } finally {
        setLoading(false);
      }
    };

    if (carId && neptunCode) {
      fetchCar();
    }
  }, [carId, neptunCode]);

  const handleDelete = async () => {
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await carService.deleteCar(neptunCode, carId);
      
      if (isInModal && onCarDeleted) {
        onCarDeleted();
      } else {
        router.push(`/?neptun=${neptunCode}`);
      }
    } catch (err) {
      console.error('Failed to delete car:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete car');
    }
  };

  if (loading) return <div className="text-center p-4">Loading car details...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!car) return <div className="text-center p-4">Car not found</div>;

  // In modal view, we don't need the container styling as the modal provides it
  const containerClass = isInModal 
    ? "" 
    : "w-full max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-[0_5px_0_0_#e5e7eb]";

  return (
    <div className={containerClass}>
      <h2 className="text-2xl font-bold mb-4">{car.brand} {car.model}</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-gray-50 rounded shadow-[0_2px_0_0_#e5e7eb]">
          <p className="text-gray-600 text-xs uppercase tracking-wider">ID</p>
          <p className="font-semibold">{car.id}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded shadow-[0_2px_0_0_#e5e7eb]">
          <p className="text-gray-600 text-xs uppercase tracking-wider">Brand</p>
          <p className="font-semibold">{car.brand}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded shadow-[0_2px_0_0_#e5e7eb]">
          <p className="text-gray-600 text-xs uppercase tracking-wider">Model</p>
          <p className="font-semibold">{car.model}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded shadow-[0_2px_0_0_#e5e7eb]">
          <p className="text-gray-600 text-xs uppercase tracking-wider">Owner</p>
          <p className="font-semibold">{car.owner}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded shadow-[0_2px_0_0_#e5e7eb]">
          <p className="text-gray-600 text-xs uppercase tracking-wider">Fuel Use</p>
          <p className="font-semibold">{car.fuelUse} L/100km</p>
        </div>
        <div className={`p-3 rounded shadow-[0_2px_0_0_#e5e7eb] ${car.electric ? 'bg-[#E6FFF3]' : 'bg-gray-50'}`}>
          <p className="text-gray-600 text-xs uppercase tracking-wider">Type</p>
          <div className="flex items-center space-x-2">
            {car.electric ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="font-semibold text-green-600">Electric</p>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-semibold">Fuel-powered</p>
              </>
            )}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded shadow-[0_2px_0_0_#e5e7eb]">
          <p className="text-gray-600 text-xs uppercase tracking-wider">Commission Date</p>
          <p className="font-semibold">{car.dayOfCommission}</p>
        </div>
      </div>
      
      {/* Only show buttons when not in a modal */}
      {!isInModal ? (
        <div className="flex space-x-4 mt-4">
          <Button 
            variant="primary"
            href={`/?neptun=${neptunCode}`}
          >
            Back to List
          </Button>
          <Button 
            variant="danger"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Car"
        message={`Are you sure you want to delete the ${car?.brand} ${car?.model}? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
} 