'use client';

import { useState, useEffect } from 'react';
import { carService } from '../services/carService';
import { Car } from '../types/car';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import CarDetail from './CarDetail';
import CarForm from './CarForm';
import ConfirmationModal from './ConfirmationModal';
import Button from './Button';

interface CarListProps {
  neptunCode: string;
}

export default function CarList({ neptunCode }: CarListProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newCarModalOpen, setNewCarModalOpen] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<number | null>(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await carService.getAllCars(neptunCode);
        setCars(data);
      } catch (err) {
        console.error('Failed to fetch cars:', err);
        setError(err instanceof Error ? err.message : 'Failed to load cars');
      } finally {
        setLoading(false);
      }
    };

    if (neptunCode) {
      fetchCars();
    }
  }, [neptunCode]);

  const handleDelete = async (id: number) => {
    setCarToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (carToDelete === null) return;
    
    try {
      await carService.deleteCar(neptunCode, carToDelete.toString());
      setCars(cars.filter(car => car.id !== carToDelete));
    } catch (err) {
      console.error('Failed to delete car:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete car');
    }
    
    setCarToDelete(null);
  };

  const openViewModal = (id: number) => {
    setSelectedCarId(id.toString());
    setViewModalOpen(true);
  };

  const openEditModal = (id: number) => {
    setSelectedCarId(id.toString());
    setEditModalOpen(true);
  };

  const openNewCarModal = () => {
    setNewCarModalOpen(true);
  };

  const refreshCarList = async () => {
    try {
      const data = await carService.getAllCars(neptunCode);
      setCars(data);
    } catch (err) {
      console.error('Failed to refresh cars:', err);
    }
  };

  const handleCarUpdated = () => {
    refreshCarList();
    setEditModalOpen(false);
    setNewCarModalOpen(false);
  };

  if (loading) return (
    <div className="bg-[#FF90BB] p-6 rounded-lg shadow-[0_5px_0_0_#e5e7eb] text-center">
      <div className="flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#FFC1DA] border-t-transparent animate-spin mb-3"></div>
        <p className="text-white font-medium">Loading cars...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 p-6 rounded-lg shadow-[0_5px_0_0_#f87171] text-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="font-medium">Error: {error}</p>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Car List</h2>
        <Button 
          variant="primary"
          onClick={openNewCarModal}
        >
          Add New Car
        </Button>
      </div>

      {cars.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-[0_5px_0_0_#e5e7eb] text-center">
          <p className="text-gray-600">No cars found.</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-[0_5px_0_0_#e5e7eb]">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Brand</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Model</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Owner</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fuel Use</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Electric</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car, index) => (
                  <tr 
                    key={car.id} 
                    className={`hover:bg-[#FFE6F0] transition-colors duration-150 ease-in-out ${index % 2 === 0 ? 'bg-white' : 'bg-[#FFF5FA]'} ${index !== cars.length - 1 ? 'border-b border-gray-200' : ''}`}
                  >
                    <td className="px-4 py-3 text-sm">{car.id}</td>
                    <td className="px-4 py-3 text-sm">{car.brand}</td>
                    <td className="px-4 py-3 text-sm">{car.model}</td>
                    <td className="px-4 py-3 text-sm">{car.owner}</td>
                    <td className="px-4 py-3 text-sm">{car.fuelUse}</td>
                    <td className="px-4 py-3 text-sm">{car.electric ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-sm flex space-x-4">
                      <button 
                        onClick={() => openViewModal(car.id)} 
                        className="text-[#FFC1DA] hover:text-[#FF90BB] font-medium hover:-translate-y-0.5 transition-transform"
                        aria-label="View car details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => openEditModal(car.id)}
                        className="text-[#FFC1DA] hover:text-[#FF90BB] font-medium hover:-translate-y-0.5 transition-transform"
                        aria-label="Edit car"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L11.828 15.1a2 2 0 01-.586.414l-4 1a1 1 0 01-1.236-1.236l1-4a1 1 0 01.414-.586l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(car.id)} 
                        className="text-red-500 hover:text-red-700 font-medium hover:-translate-y-0.5 transition-transform"
                        aria-label="Delete car"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Car Modal */}
      <Modal 
        isOpen={viewModalOpen} 
        onClose={() => setViewModalOpen(false)} 
        title="Car Details"
      >
        {selectedCarId && (
          <CarDetail 
            carId={selectedCarId} 
            neptunCode={neptunCode} 
            isInModal={true}
            onCarDeleted={() => {
              refreshCarList();
              setViewModalOpen(false);
            }}
          />
        )}
      </Modal>

      {/* Edit Car Modal */}
      <Modal 
        isOpen={editModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        title="Edit Car"
      >
        {selectedCarId && (
          <CarForm 
            neptunCode={neptunCode} 
            carId={selectedCarId} 
            onSuccess={handleCarUpdated}
            isInModal={true}
          />
        )}
      </Modal>

      {/* New Car Modal */}
      <Modal 
        isOpen={newCarModalOpen} 
        onClose={() => setNewCarModalOpen(false)} 
        title="Add New Car"
      >
        <CarForm 
          neptunCode={neptunCode} 
          onSuccess={handleCarUpdated}
          isInModal={true}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Car"
        message="Are you sure you want to delete this car? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
} 