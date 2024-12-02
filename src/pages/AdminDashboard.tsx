import React, { useState, useEffect, useCallback } from 'react';
import { get, ref, update } from 'firebase/database';
import { db } from '../firebaseConfig'; // Adjust the path according to your project structure
import { Link } from 'react-router-dom';

interface BusTiming {
  end: string;
  start: string;
  time: string;
  distance?: number; // Optional single distance value
}

interface BusData {
  busId: string;
  busName: {
    Bengali: string;
    English: string;
    Hindi: string;
  };
  busType: string;
  email: string;
  images: {
    front: string;
    rear: string;
  };
  ownerDetails: {
    address: string;
    contact: string;
    name: string;
  };
  priceDetails: {
    perKmAdult: number;
    perKmNonAdult: number;
  };
  registrationNumber: string;
  route: {
    startLocation: string;
    departureLocation: string;
    intermediateStops: string[]; // Array of stop names
  };
  seatingCapacity: number;
  timings: BusTiming[]; // Ensure this is always initialized as an array
}

const AdminDashboard: React.FC = () => {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);
  const [newDistance, setNewDistance] = useState<number | undefined>(undefined);
  const [editingTimingIndex, setEditingTimingIndex] = useState<number | null>(null);

  // Fetch buses data from Firebase
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const busesRef = ref(db, 'buses');
        const snapshot = await get(busesRef);

        if (snapshot.exists()) {
          const busData = snapshot.val() as Record<string, Omit<BusData, 'busId'>>;
          const busesArray = Object.keys(busData).map((busId) => ({
            busId,
            ...busData[busId],
            timings: busData[busId].timings || [],
            route: busData[busId].route || { startLocation: '', departureLocation: '', intermediateStops: [] },
          }));
          setBuses(busesArray);
        } else {
          console.log('No buses available');
        }
      } catch (error) {
        console.error('Error fetching buses:', error);
      }
    };

    fetchBuses();
  }, []);

  // Handle bus selection and distance calculation
  const handleBusClick = useCallback((bus: BusData) => {
    setNewDistance(undefined);
    setEditingTimingIndex(null);
    setSelectedBus(bus);
    handleDistanceCalculation(bus);
  }, []);

  // Distance calculation logic
  const handleDistanceCalculation = async (bus: BusData) => {
    const routeStartLocation = bus.route.startLocation;
    const routeEndLocation = bus.route.departureLocation;

    const lookupKey = `${routeStartLocation}_${routeEndLocation}`;
    const intermediateDistanceRef = ref(db, `intermediateDistances/${lookupKey}`);

    try {
      const snapshot = await get(intermediateDistanceRef);

      if (snapshot.exists()) {
        const routeData = snapshot.val() as {
          start: string;
          end: string;
          intermediateStops: { stop: string; distance: number }[];
          lastSegmentDistance: number;
        };

        const fullRoute = [
          { stop: routeData.start.toUpperCase(), distance: 0 },
          ...routeData.intermediateStops.map(stop => ({
            stop: stop.stop.toUpperCase(),
            distance: stop.distance,
          })),
          { stop: routeData.end.toUpperCase(), distance: routeData.lastSegmentDistance }
        ];

        const updatedTimings = bus.timings.map(timing => {
          const normalizedStart = timing.start.trim().toUpperCase();
          const normalizedEnd = timing.end.trim().toUpperCase();

          const startIndex = fullRoute.findIndex(stop => stop.stop === normalizedStart);
          const endIndex = fullRoute.findIndex(stop => stop.stop === normalizedEnd);

          if (startIndex !== -1 && endIndex !== -1) {
            if (startIndex < endIndex) {
              const totalDistance = fullRoute.slice(startIndex + 1, endIndex + 1).reduce((acc, stop) => acc + stop.distance, 0);
              timing.distance = totalDistance;
            } else if (startIndex > endIndex) {
              const totalDistance = fullRoute.slice(endIndex + 1, startIndex + 1).reverse().reduce((acc, stop) => acc + stop.distance, 0);
              timing.distance = totalDistance;
            } else {
              timing.distance = 0;
            }
          } else {
            timing.distance = undefined;
            console.error('Start or end location not found in the route');
          }

          return timing;
        });

        const busRef = ref(db, `buses/${bus.busId}`);
        await update(busRef, { timings: updatedTimings });

        setSelectedBus(prevBus => (prevBus ? { ...prevBus, timings: updatedTimings } : null));

        console.log('Distances calculated and saved successfully');
      } else {
        console.error(`Route not found for ${lookupKey}`);
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
    }
  };

  const handleAddDistance = (timingIndex: number) => {
    if (selectedBus && newDistance !== undefined) {
      const updatedBus = { ...selectedBus };
      const selectedTiming = updatedBus.timings[timingIndex];
      selectedTiming.distance = newDistance;

      const busRef = ref(db, `buses/${selectedBus.busId}`);
      update(busRef, updatedBus)
        .then(() => {
          console.log('Distance added successfully');
          setNewDistance(undefined);
          setEditingTimingIndex(null);
          handleDistanceCalculation(selectedBus);
        })
        .catch((error) => console.error('Error updating distance:', error));
    } else {
      console.error('Invalid data for adding distance');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 py-10">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-700 mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Bus List</h2>
            <ul className="space-y-3">
              {buses.length > 0 ? (
                buses.map((bus) => (
                  <li
                    key={bus.busId}
                    className="cursor-pointer text-lg font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    onClick={() => handleBusClick(bus)}
                  >
                    {bus.busName.English}
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No buses available</p>
              )}
            </ul>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              {selectedBus ? `${selectedBus.busName.English} Timings & Distances` : 'Select a Bus to View Details'}
            </h2>
            {selectedBus ? (
              selectedBus.timings.length > 0 ? (
                <ul className="space-y-8">
                  {selectedBus.timings.map((timing, timingIndex) => (
                    <li key={timingIndex} className="text-lg text-gray-700">
                      <div>
                        <span className="font-semibold">Start:</span> {timing.start} -{' '}
                        <span className="font-semibold">End:</span> {timing.end} |{' '}
                        <span className="font-semibold">Time:</span> {timing.time}
                      </div>
                      {timing.distance !== undefined ? (
                        <p className="text-gray-600 mt-1">
                          <span className="font-semibold">Distance:</span> {timing.distance} km
                        </p>
                      ) : (
                        <p className="text-gray-500">No distance available</p>
                      )}

                      {editingTimingIndex === timingIndex ? (
                        <div className="mt-4">
                          <h3 className="font-semibold mb-2">Add New Distance</h3>
                          <input
                            type="number"
                            placeholder="Distance (km)"
                            value={newDistance || ''}
                            onChange={(e) => setNewDistance(parseFloat(e.target.value))}
                            className="border border-gray-300 p-2 rounded w-full mb-2"
                          />
                          <button
                            onClick={() => handleAddDistance(timingIndex)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          >
                            Add Distance
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingTimingIndex(timingIndex)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
                        >
                          Add Distance
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No timings available</p>
              )
            ) : (
              <p className="text-gray-500">Select a bus to view timings and add distances</p>
            )}
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link to="/distance" className="text-lg text-pink-600 font-semibold hover:text-pink-700 transition-colors">
            Add Distance
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
