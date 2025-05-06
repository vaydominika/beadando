'use client';

import { useState, useEffect } from 'react';
import { carService } from '../services/carService';
import { Car } from '../types/car';
import { useRouter } from 'next/navigation';
import React from 'react';
import Button from './Button';

interface CarFormProps {
  neptunCode: string;
  carId?: string;
  isInModal?: boolean;
  onSuccess?: () => void;
}

// Valid car brands from the OpenAPI spec
const validBrands = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz', 
  'Volkswagen', 'Audi', 'Hyundai', 'Kia', 'Subaru', 'Lexus', 'Mazda', 
  'Tesla', 'Jeep', 'Porsche', 'Volvo', 'Jaguar', 'Land Rover', 'Mitsubishi',
  'Ferrari', 'Lamborghini'
];

export default function CarForm({ neptunCode, carId, isInModal = false, onSuccess }: CarFormProps) {
  const isEditMode = !!carId;
  const router = useRouter();
  
  // Refs for form elements
  const brandSelectRef = React.useRef<HTMLSelectElement>(null);
  
  const [formData, setFormData] = useState<Omit<Car, 'id'>>({
    brand: '',
    model: '',
    fuelUse: 0,
    owner: '',
    dayOfCommission: new Date().toISOString().split('T')[0],
    electric: false
  });
  
  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false); // Track if user attempted to submit

  useEffect(() => {
    if (isEditMode) {
      const fetchCar = async () => {
        try {
          setLoading(true);
          const car = await carService.getCarById(neptunCode, carId);
          // Extract all fields except id
          const { id, ...carData } = car;
          setFormData(carData);
        } catch (err) {
          console.error('Failed to fetch car:', err);
          setError(err instanceof Error ? err.message : 'Failed to load car details');
        } finally {
          setLoading(false);
        }
      };

      fetchCar();
    }
  }, [isEditMode, carId, neptunCode]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Brand validation
    if (!formData.brand) {
      errors.brand = 'Brand is required';
      // Focus on brand select when validation fails and there's a brand error
      setTimeout(() => {
        brandSelectRef.current?.focus();
      }, 100);
    } else if (!validBrands.includes(formData.brand)) {
      errors.brand = 'Invalid car brand';
    }

    // Model validation
    if (!formData.model) {
      errors.model = 'Model is required';
    } else if (formData.model.length < 1) {
      errors.model = 'Model must not be empty';
    }

    // Fuel use validation
    if (formData.electric) {
      if (formData.fuelUse !== 0) {
        errors.fuelUse = 'Fuel use must be 0 for electric cars';
      }
    } else if (formData.fuelUse === undefined || formData.fuelUse === null || isNaN(formData.fuelUse)) {
      errors.fuelUse = 'Fuel use value is required';
    } else if (formData.fuelUse <= 0) {
      errors.fuelUse = 'Fuel use must be greater than 0 for non-electric cars';
    }

    // Owner validation
    if (!formData.owner) {
      errors.owner = 'Owner is required';
    } else if (!formData.owner.includes(' ')) {
      errors.owner = 'Owner name must contain at least one space';
    }

    // Commission date validation
    if (!formData.dayOfCommission) {
      errors.dayOfCommission = 'Commission date is required';
    } else {
      const date = new Date(formData.dayOfCommission);
      if (isNaN(date.getTime())) {
        errors.dayOfCommission = 'Please enter a valid date';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let newFormData;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      newFormData = {
        ...formData,
        [name]: checked,
        // If electric is turned on, set fuelUse to 0
        ...(name === 'electric' && checked ? { fuelUse: 0 } : {})
      };
    } else {
      newFormData = {
        ...formData,
        [name]: type === 'number' ? parseFloat(value) : value
      };
    }
    
    setFormData(newFormData);
    
    // Only validate on change if user has already attempted to submit
    if (attempted) {
      validateForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark form as attempted to submit
    setAttempted(true);
    
    // Run validation and stop if there are errors
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (isEditMode) {
        const carToUpdate = { id: parseInt(carId), ...formData };
        await carService.updateCar(neptunCode, carToUpdate);
      } else {
        await carService.createCar(neptunCode, formData);
      }

      if (isInModal && onSuccess) {
        onSuccess();
      } else {
        router.push(`/?neptun=${neptunCode}`);
      }
    } catch (err) {
      console.error('Failed to save car:', err);
      setError(err instanceof Error ? err.message : 'Failed to save car');
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isInModal && onSuccess) {
      onSuccess();
    } else {
      router.push(`/?neptun=${neptunCode}`);
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;

  // In modal view, we don't need the container styling as the modal provides it
  const containerClass = isInModal 
    ? "" 
    : "w-full max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-[0_5px_0_0_#e5e7eb]";

  return (
    <div className={containerClass}>
      {!isInModal && (
        <h2 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Car' : 'Add New Car'}</h2>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded shadow-[0_2px_0_0_#f87171]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label htmlFor="brand" className="block text-gray-700 mb-1">Brand *</label>
          <select
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            ref={brandSelectRef}
            className={`w-full p-2 border rounded shadow-[0_4px_0_0_#d1d5db] ${validationErrors.brand ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select a brand</option>
            {validBrands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
          {validationErrors.brand && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.brand}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="model" className="block text-gray-700 mb-1">Model *</label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className={`w-full p-2 border rounded shadow-[0_4px_0_0_#d1d5db] ${validationErrors.model ? 'border-red-500' : 'border-gray-300'}`}
          />
          {validationErrors.model && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.model}</p>
          )}
        </div>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="electric"
            name="electric"
            checked={formData.electric}
            onChange={handleChange}
            className="mr-2 h-5 w-5 shadow-[0_2px_0_0_#d1d5db] rounded"
          />
          <label htmlFor="electric" className="text-gray-700">Electric Car</label>
        </div>

        <div className="mb-4">
          <label htmlFor="fuelUse" className="block text-gray-700 mb-1">
            Fuel Use (L/100km) *
            {formData.electric && <span className="text-gray-500 ml-2">(Must be 0 for electric cars)</span>}
          </label>
          <input
            type="number"
            id="fuelUse"
            name="fuelUse"
            value={formData.fuelUse}
            onChange={handleChange}
            disabled={formData.electric}
            className={`w-full p-2 border rounded shadow-[0_4px_0_0_#d1d5db] ${validationErrors.fuelUse ? 'border-red-500' : 'border-gray-300'} ${formData.electric ? 'bg-gray-100' : ''}`}
          />
          {validationErrors.fuelUse && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.fuelUse}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="owner" className="block text-gray-700 mb-1">Owner *</label>
          <input
            type="text"
            id="owner"
            name="owner"
            value={formData.owner}
            onChange={handleChange}
            className={`w-full p-2 border rounded shadow-[0_4px_0_0_#d1d5db] ${validationErrors.owner ? 'border-red-500' : 'border-gray-300'}`}
          />
          {validationErrors.owner && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.owner}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="dayOfCommission" className="block text-gray-700 mb-1">Commission Date *</label>
          <input
            type="date"
            id="dayOfCommission"
            name="dayOfCommission"
            value={formData.dayOfCommission}
            onChange={handleChange}
            className={`w-full p-2 border rounded shadow-[0_4px_0_0_#d1d5db] ${validationErrors.dayOfCommission ? 'border-red-500' : 'border-gray-300'}`}
          />
          {validationErrors.dayOfCommission && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.dayOfCommission}</p>
          )}
        </div>

        <div className="flex space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={submitting}
            loadingText="Saving..."
          >
            {isEditMode ? 'Update Car' : 'Add Car'}
          </Button>
        </div>
      </form>
    </div>
  );
}
