import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { db } from '../firebaseConfig';
import '@fontsource/poppins';

interface BusData {
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
    departureLocation: string;
    intermediateStops: string[];
    startLocation: string;
  };
  seatingCapacity: number;
  timings: {
    start: string;
    end: string;
    time: string;
  }[];
}

const BusDashboard: React.FC = () => {
  const { busId } = useParams<{ busId: string }>();
  const [editableData, setEditableData] = useState<BusData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (busId) {
      const fetchBusData = async () => {
        try {
          const busRef = ref(db, `buses/${busId}`);
          const snapshot = await get(busRef);

          if (snapshot.exists()) {
            const data = snapshot.val();
            setEditableData(data);
          } else {
            setError('Bus not found.');
          }
        } catch (err) {
          setError('Error fetching bus data.');
          console.error('Fetch error:', err);
        }
      };

      fetchBusData();
    }
  }, [busId]);

  const addIntermediateStop = () => {
    setEditableData(prevData => ({
      ...prevData!,
      route: {
        ...prevData!.route,
        intermediateStops: [...(prevData?.route.intermediateStops || []), '']
      }
    }));
  };

  const updateIntermediateStop = (index: number, value: string) => {
    const updatedStops = [...(editableData?.route.intermediateStops || [])];
    updatedStops[index] = value;

    setEditableData(prevData => ({
      ...prevData!,
      route: {
        ...prevData!.route,
        intermediateStops: updatedStops,
      }
    }));
  };

  const removeIntermediateStop = (index: number) => {
    const updatedStops = [...(editableData?.route.intermediateStops || [])];
    updatedStops.splice(index, 1);

    setEditableData(prevData => ({
      ...prevData!,
      route: {
        ...prevData!.route,
        intermediateStops: updatedStops,
      }
    }));
  };

  const addTiming = () => {
    setEditableData(prevData => ({
      ...prevData!,
      timings: [...(prevData?.timings || []), { start: '', end: '', time: '' }]
    }));
  };

  const updateTiming = (index: number, field: keyof BusData['timings'][0], value: string) => {
    const updatedTimings = [...(editableData?.timings || [])];
    updatedTimings[index] = { ...updatedTimings[index], [field]: value };

    setEditableData(prevData => ({
      ...prevData!,
      timings: updatedTimings,
    }));
  };

  const removeTiming = (index: number) => {
    const updatedTimings = [...(editableData?.timings || [])];
    updatedTimings.splice(index, 1);

    setEditableData(prevData => ({
      ...prevData!,
      timings: updatedTimings,
    }));
  };

  const generateTimingEntries = () => {
    if (!editableData || !editableData.route) return null;

    const { startLocation, departureLocation, intermediateStops } = editableData.route;
    const allStops = [startLocation, ...intermediateStops, departureLocation];
    const timingEntries = [];
    const timings = editableData?.timings || [];

    // Generate Forward Direction Timings
    for (let i = 0; i < allStops.length - 1; i++) {
      for (let j = i + 1; j < allStops.length; j++) {
        const fromStop = allStops[i];
        const toStop = allStops[j];

        const existingTiming = timings.find(t => t.start === fromStop && t.end === toStop);

        timingEntries.push(
          <div key={`forward-${fromStop}-${toStop}`} className="flex flex-col mb-2 sm:mb-4">
            <input
              type="text"
              placeholder="Start Location"
              value={fromStop}
              readOnly
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-md mb-2"
            />
            <input
              type="text"
              placeholder="End Location"
              value={toStop}
              readOnly
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-md mb-2"
            />
            <input
              type="text"
              placeholder="Time"
              value={existingTiming?.time || ''}
              onChange={(e) => {
                const updatedTime = e.target.value;
                if (existingTiming) {
                  updateTiming(timings.indexOf(existingTiming), 'time', updatedTime);
                } else {
                  const newTiming = { start: fromStop, end: toStop, time: updatedTime };
                  setEditableData(prevData => ({
                    ...prevData!,
                    timings: [...timings, newTiming],
                  }));
                }
              }}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-md"
            />
            <button
              type="button"
              onClick={() => {
                if (existingTiming) {
                  removeTiming(timings.indexOf(existingTiming));
                }
              }}
              className="mt-2 bg-red-500 text-white py-2 px-4 rounded-md"
            >
              {existingTiming ? 'Remove Timing' : 'Clear'}
            </button>
          </div>
        );
      }
    }

    // Generate Backward Direction Timings
    for (let i = allStops.length - 1; i > 0; i--) {
      for (let j = i - 1; j >= 0; j--) {
        const fromStop = allStops[i];
        const toStop = allStops[j];

        const existingTiming = timings.find(t => t.start === fromStop && t.end === toStop);

        timingEntries.push(
          <div key={`backward-${fromStop}-${toStop}`} className="flex flex-col mb-2 sm:mb-4">
            <input
              type="text"
              placeholder="Start Location"
              value={fromStop}
              readOnly
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-md mb-2"
            />
            <input
              type="text"
              placeholder="End Location"
              value={toStop}
              readOnly
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-md mb-2"
            />
            <input
              type="text"
              placeholder="Time"
              value={existingTiming?.time || ''}
              onChange={(e) => {
                const updatedTime = e.target.value;
                if (existingTiming) {
                  updateTiming(timings.indexOf(existingTiming), 'time', updatedTime);
                } else {
                  const newTiming = { start: fromStop, end: toStop, time: updatedTime };
                  setEditableData(prevData => ({
                    ...prevData!,
                    timings: [...timings, newTiming],
                  }));
                }
              }}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-md"
            />
            <button
              type="button"
              onClick={() => {
                if (existingTiming) {
                  removeTiming(timings.indexOf(existingTiming));
                }
              }}
              className="mt-2 bg-red-500 text-white py-2 px-4 rounded-md"
            >
              {existingTiming ? 'Remove Timing' : 'Clear'}
            </button>
          </div>
        );
      }
    }

    return timingEntries;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editableData) return;

    try {
      const busRef = ref(db, `buses/${busId}`);
      await update(busRef, editableData);
      alert('Bus data updated successfully.');
    } catch (err) {
      console.error('Error updating bus data:', err);
      alert('Error updating bus data.');
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-4 max-w-xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {editableData ? (
        <form onSubmit={handleSubmit}>
          {/* Bus Name */}
          <div className="flex flex-col mb-2 sm:mb-4">
  <label htmlFor="busName" className="font-bold mb-1 sm:mb-2">
    Bus Name (English)
  </label>
  <input
    type="text"
    id="busName"
    name="busName.English"
    value={editableData.busName.English}
    readOnly
    className="p-2 sm:p-3 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
  />
</div>


          {/* Intermediate Stops */}
          <div className="flex flex-col mb-6">
            <h3 className="text-gray-800 font-semibold mb-2">Intermediate Stops</h3>
            {editableData.route.intermediateStops.map((stop, index) => (
              <div key={index} className="flex flex-col mb-2 sm:mb-4">
                <input
                  type="text"
                  placeholder={`Stop ${index + 1}`}
                  value={stop}
                  onChange={(e) => updateIntermediateStop(index, e.target.value)}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeIntermediateStop(index)}
                  className="mt-2 bg-red-500 text-white py-2 px-4 rounded-md"
                >
                  Remove Stop
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addIntermediateStop}
              className="bg-blue-500 text-white py-2 px-4 rounded-md"
            >
              Add Stop
            </button>
          </div>

          {/* Timings */}
          <div className="flex flex-col mb-6">
            <h3 className="text-gray-800 font-semibold mb-2">Bus Timings</h3>
            {generateTimingEntries()}
            <button
              type="button"
              onClick={addTiming}
              className="bg-blue-500 text-white py-2 px-4 rounded-md"
            >
              Add Timing
            </button>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-md"
          >
            Update Bus Data
          </button>
        </form>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default BusDashboard;
