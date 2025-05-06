import { Car } from '../types/car';

const API_BASE_URL = 'https://iit-playground.arondev.hu';

export const carService = {
  async getAllCars(neptunCode: string): Promise<Car[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/${neptunCode}/car`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch cars');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching cars:', error);
      throw error;
    }
  },

  async getCarById(neptunCode: string, id: string): Promise<Car> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/${neptunCode}/car/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch car');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching car:', error);
      throw error;
    }
  },

  async createCar(neptunCode: string, car: Omit<Car, 'id'>): Promise<Car> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/${neptunCode}/car`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(car),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create car');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating car:', error);
      throw error;
    }
  },

  async updateCar(neptunCode: string, car: Car): Promise<Car> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/${neptunCode}/car`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(car),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update car');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating car:', error);
      throw error;
    }
  },

  async deleteCar(neptunCode: string, id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/${neptunCode}/car/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete car');
      }
    } catch (error) {
      console.error('Error deleting car:', error);
      throw error;
    }
  },
}; 