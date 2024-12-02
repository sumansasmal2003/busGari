import React, { useState } from 'react';
import { ref, get, update } from 'firebase/database';
import { db } from '../firebaseConfig'; // Adjust the path according to your project structure

interface IntermediateStop {
  stop: string;
  distance: number; // Distance from the previous stop
}

interface IntermediateDistance {
  start: string;
  end: string;
  intermediateStops: IntermediateStop[];
  lastSegmentDistance: number; // Distance from the last intermediate stop to the end location
}

const Distance: React.FC = () => {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [intermediateStops, setIntermediateStops] = useState<IntermediateStop[]>([]);
  const [currentStop, setCurrentStop] = useState('');
  const [currentDistance, setCurrentDistance] = useState<number | null>(null);
  const [lastSegmentDistance, setLastSegmentDistance] = useState<number | null>(null);

  const [routeStartLocation, setRouteStartLocation] = useState(''); // New input for route start
  const [routeEndLocation, setRouteEndLocation] = useState(''); // New input for route end

  const [calcStart, setCalcStart] = useState('');
  const [calcEnd, setCalcEnd] = useState('');
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editStop, setEditStop] = useState<string>('');
  const [editDistance, setEditDistance] = useState<number | null>(null);

  // Add an intermediate stop to the list
  const addIntermediateStop = () => {
    if (currentStop && currentDistance !== null) {
      setIntermediateStops(prevStops => [
        ...prevStops,
        { stop: currentStop, distance: currentDistance }
      ]);
      setCurrentStop('');
      setCurrentDistance(null);
    }
  };

  // Submit the form with start, end, and intermediate stops
  const handleSubmit = async () => {
    if (startLocation && endLocation && intermediateStops.length > 0 && lastSegmentDistance !== null) {
      const intermediateDistanceRef = ref(db, `intermediateDistances/${startLocation}_${endLocation}`);
      const data: IntermediateDistance = {
        start: startLocation,
        end: endLocation,
        intermediateStops,
        lastSegmentDistance
      };

      try {
        await update(intermediateDistanceRef, data);
        console.log('Intermediate distances added successfully');
        setStartLocation('');
        setEndLocation('');
        setIntermediateStops([]);
        setLastSegmentDistance(null);
      } catch (error) {
        console.error('Error updating intermediate distances:', error);
      }
    } else {
      console.error('Invalid data for adding intermediate distances');
    }
  };

  // Calculate distance between two locations
  const handleDistanceCalculation = async () => {
    if (calcStart && calcEnd && routeStartLocation && routeEndLocation) {
      const lookupKey = `${routeStartLocation}_${routeEndLocation}`; // Use dynamically entered start and end locations for the route
      const intermediateDistanceRef = ref(db, `intermediateDistances/${lookupKey}`);

      console.log(`Attempting to fetch data with key: ${lookupKey}`);

      try {
        const snapshot = await get(intermediateDistanceRef);

        if (snapshot.exists()) {
          const routeData = snapshot.val() as IntermediateDistance;
          console.log('Route data found:', routeData);

          // Normalize input (case insensitive)
          const normalizedCalcStart = calcStart.trim().toUpperCase();
          const normalizedCalcEnd = calcEnd.trim().toUpperCase();

          // Construct full route (including the last segment)
          const fullRoute = [
            { stop: routeData.start.toUpperCase(), distance: 0 }, // Add start location explicitly
            ...routeData.intermediateStops.map(stop => ({
              stop: stop.stop.toUpperCase(),
              distance: stop.distance
            })),
            { stop: routeData.end.toUpperCase(), distance: routeData.lastSegmentDistance }
          ];

          console.log('Full route:', fullRoute);

          // If start and end are the same
          if (normalizedCalcStart === normalizedCalcEnd) {
            setCalculatedDistance(0); // Distance to itself is zero
            return;
          }

          // Find start and end indexes in the full route
          const startIndex = fullRoute.findIndex(stop => stop.stop === normalizedCalcStart);
          const endIndex = fullRoute.findIndex(stop => stop.stop === normalizedCalcEnd);

          console.log('Start index:', startIndex, 'End index:', endIndex);

          // Ensure valid start and end indexes
          if (startIndex !== -1 && endIndex !== -1) {
            if (startIndex < endIndex) {
              // Forward direction
              const totalDistance = fullRoute.slice(startIndex + 1, endIndex + 1).reduce((acc, stop) => acc + stop.distance, 0);
              setCalculatedDistance(totalDistance);
            } else if (startIndex > endIndex) {
              // Reverse direction
              const totalDistance = fullRoute.slice(endIndex, startIndex).reverse().reduce((acc, stop) => acc + stop.distance, 0);
              setCalculatedDistance(totalDistance);
            } else {
              console.error('Start and end locations are out of order');
              setCalculatedDistance(null);
            }
          } else {
            console.error('Start or end location not found in the route');
            setCalculatedDistance(null);
          }
        } else {
          console.error(`Route not found in intermediateDistances for ${lookupKey}`);
          setCalculatedDistance(null);
        }
      } catch (error) {
        console.error('Error calculating distance:', error);
        setCalculatedDistance(null);
      }
    } else {
      console.error('Calculation start or end location is missing');
    }
  };

  const handleEditClick = (index: number) => {
    const stopToEdit = intermediateStops[index];
    setEditIndex(index);
    setEditStop(stopToEdit.stop);
    setEditDistance(stopToEdit.distance);
  };

  const handleEditSave = () => {
    if (editIndex !== null && editStop && editDistance !== null) {
      setIntermediateStops(prevStops =>
        prevStops.map((stop, index) =>
          index === editIndex
            ? { stop: editStop, distance: editDistance }
            : stop
        )
      );
      setEditIndex(null);
      setEditStop('');
      setEditDistance(null);
    }
  };

  const handleDeleteClick = (index: number) => {
    setIntermediateStops(prevStops =>
      prevStops.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Manage Distances</h1>

        {/* Add Intermediate Stops Form */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Add Intermediate Stops</h3>
          <input
            type="text"
            placeholder="Start Location"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            className="border p-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="End Location"
            value={endLocation}
            onChange={(e) => setEndLocation(e.target.value)}
            className="border p-2 mb-2 w-full"
          />
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Add Intermediate Stop:</h4>
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                placeholder="Intermediate Stop"
                value={currentStop}
                onChange={(e) => setCurrentStop(e.target.value)}
                className="border p-2 w-full"
              />
              <input
                type="number"
                placeholder="Distance (km)"
                value={currentDistance || ''}
                onChange={(e) => setCurrentDistance(parseFloat(e.target.value))}
                className="border p-2 w-24"
              />
              <button
                onClick={addIntermediateStop}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Add Stop
              </button>
            </div>
            <ul className="list-disc ml-6">
              {intermediateStops.map((stop, index) => (
                <li key={index} className="flex items-center justify-between mb-2">
                  {editIndex === index ? (
                    <div className="flex space-x-2">
                      <input
                        title='Edit Stop'
                        type="text"
                        value={editStop}
                        onChange={(e) => setEditStop(e.target.value)}
                        className="border p-2 w-full"
                      />
                      <input
                        title='Edit Distance'
                        type="number"
                        value={editDistance || ''}
                        onChange={(e) => setEditDistance(parseFloat(e.target.value))}
                        className="border p-2 w-24"
                      />
                      <button
                        onClick={handleEditSave}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditIndex(null)}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span>{`${stop.stop} - ${stop.distance} km`}</span>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleEditClick(index)}
                          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(index)}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <input
              type="number"
              placeholder="Last Segment Distance (km)"
              value={lastSegmentDistance || ''}
              onChange={(e) => setLastSegmentDistance(parseFloat(e.target.value))}
              className="border p-2 mb-4 w-full"
            />
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
            >
              Save Route
            </button>
          </div>
        </div>

        {/* Distance Calculation Form */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Calculate Distance</h3>

          {/* New Inputs for Route Start and End */}
          <input
            type="text"
            placeholder="Route Start Location"
            value={routeStartLocation}
            onChange={(e) => setRouteStartLocation(e.target.value)}
            className="border p-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Route End Location"
            value={routeEndLocation}
            onChange={(e) => setRouteEndLocation(e.target.value)}
            className="border p-2 mb-2 w-full"
          />

          <input
            type="text"
            placeholder="Calculation Start Location"
            value={calcStart}
            onChange={(e) => setCalcStart(e.target.value)}
            className="border p-2 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Calculation End Location"
            value={calcEnd}
            onChange={(e) => setCalcEnd(e.target.value)}
            className="border p-2 mb-4 w-full"
          />
          <button
            onClick={handleDistanceCalculation}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Calculate Distance
          </button>

          {calculatedDistance !== null && (
            <p className="text-xl font-semibold mt-4">
              Calculated Distance: {calculatedDistance} km
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Distance;
