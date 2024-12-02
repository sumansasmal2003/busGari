import React, { useState, useEffect, useRef } from 'react';
import { get, ref } from 'firebase/database';
import { db } from '../firebaseConfig'; // Adjust the path according to your project structure

interface BusImages {
  front: string;
  rear: string;
}

interface BusOwnerDetails {
  address: string;
  contact: string;
  name: string;
}

interface BusPriceDetails {
  perKmAdult: number;
  perKmNonAdult: number;
}

interface BusTiming {
  end: string;
  start: string;
  time: string;
  distance?: number; // Optional distance for this timing
  fare?: number;
}

interface BusRoute {
  departureLocation: string;
  intermediateStops: string[];
  startLocation: string;
}

interface BusData {
  busName: {
    Bengali: string;
    English: string;
    Hindi: string;
  };
  busType: string;
  images: BusImages;
  ownerDetails: BusOwnerDetails;
  priceDetails: BusPriceDetails;
  registrationNumber: string;
  route: BusRoute;
  seatingCapacity: number;
  timings: BusTiming[];
}

const SearchSection: React.FC = () => {
  const [busName, setBusName] = useState<string>('');
  const [startLocation, setStartLocation] = useState<string>('');
  const [endLocation, setEndLocation] = useState<string>('');
  const [startTime, setStartTime] = useState<string>(''); // Time range start
  const [endTime, setEndTime] = useState<string>(''); // Time range end
  const [searchResults, setSearchResults] = useState<BusData[]>([]);
  const [locations, setLocations] = useState<string[]>([]); // State to store unique locations
  const [filteredStartSuggestions, setFilteredStartSuggestions] = useState<string[]>([]);
  const [filteredEndSuggestions, setFilteredEndSuggestions] = useState<string[]>([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState<boolean>(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState<boolean>(false);

  // Refs to manage focus
  const startSuggestionsRef = useRef<HTMLUListElement>(null);
  const endSuggestionsRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const busesRef = ref(db, 'buses');
        const snapshot = await get(busesRef);

        if (snapshot.exists()) {
          const buses = snapshot.val() as Record<string, BusData>;
          const allLocations = new Set<string>();

          Object.values(buses).forEach((bus) => {
            allLocations.add(bus.route.startLocation.toLowerCase());
            allLocations.add(bus.route.departureLocation.toLowerCase());
            bus.route.intermediateStops.forEach((stop) => {
              allLocations.add(stop.toLowerCase());
            });
          });

          setLocations(Array.from(allLocations));
        } else {
          console.log('No data available');
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []); // Empty dependency array to run only once when the component mounts

   // Handle start location typing
  const handleStartLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = e.target.value.toLowerCase();
    setStartLocation(userInput);

    if (userInput) {
      const filteredSuggestions = locations.filter((location) =>
        location.startsWith(userInput)
      );
      setFilteredStartSuggestions(filteredSuggestions);
      setShowStartSuggestions(true);
    } else {
      setShowStartSuggestions(false);
    }
  };

 // Handle end location typing
 const handleEndLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const userInput = e.target.value.toLowerCase();
  setEndLocation(userInput);

  if (userInput) {
    const filteredSuggestions = locations.filter((location) =>
      location.startsWith(userInput)
    );
    setFilteredEndSuggestions(filteredSuggestions);
    setShowEndSuggestions(true);
  } else {
    setShowEndSuggestions(false);
  }
};

  // Set the selected start location from suggestions
  const handleStartLocationSelect = (location: string) => {
    setStartLocation(location);
    setShowStartSuggestions(false);
  };

  // Set the selected end location from suggestions
  const handleEndLocationSelect = (location: string) => {
    setEndLocation(location);
    setShowEndSuggestions(false);
  };

   // Handle clicks outside the suggestion list
   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        startSuggestionsRef.current &&
        !startSuggestionsRef.current.contains(event.target as Node)
      ) {
        setShowStartSuggestions(false);
      }
      if (
        endSuggestionsRef.current &&
        !endSuggestionsRef.current.contains(event.target as Node)
      ) {
        setShowEndSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const calculateFare = (bus: BusData, distance: number) => {
    // Assuming the fare calculation is based on adult fare
    return distance * bus.priceDetails.perKmAdult;
  };

  const handleBusSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const busesRef = ref(db, 'buses');
      const snapshot = await get(busesRef);

      if (snapshot.exists()) {
        const buses = snapshot.val() as Record<string, BusData>;
        const results = Object.values(buses).filter((bus) =>
          bus.busName.English.toLowerCase().includes(busName.toLowerCase()) ||
          bus.busName.Bengali.toLowerCase().includes(busName.toLowerCase()) ||
          bus.busName.Hindi.toLowerCase().includes(busName.toLowerCase())
        );
        setSearchResults(results);
      } else {
        console.log('No data available');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error fetching bus data:', error);
    }
  };

  const handleRouteSearch = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const busesRef = ref(db, 'buses');
      const snapshot = await get(busesRef);
  
      if (snapshot.exists()) {
        const buses = snapshot.val() as Record<string, BusData>;
        const results: BusData[] = [];
  
        Object.values(buses).forEach((bus) => {
          // Filter timings that match both start and end location, as well as time if provided
          const matchingTimings = (bus.timings || []).filter((timing) => {
            const busStart = timing.start ? timing.start.toLowerCase() : '';
            const busEnd = timing.end ? timing.end.toLowerCase() : '';
            const busTimeStr = timing.time ? timing.time.trim() : '';
  
            const startMatches = busStart === startLocation.toLowerCase();
            const endMatches = busEnd === endLocation.toLowerCase();
  
            // If start and end locations match
            if (startMatches && endMatches) {
              let withinTimeRange = true; // Default to true if no time range is provided
  
              // If time range is provided, check if bus time is within range
              if (startTime && endTime) {
                const busTime = new Date(`1970-01-01T${busTimeStr}:00`);
                const start = new Date(`1970-01-01T${startTime}:00`);
                const end = new Date(`1970-01-01T${endTime}:00`);
                withinTimeRange = busTime >= start && busTime <= end;
              }
  
              // Return true if within time range (or if no time range is provided)
              return withinTimeRange;
            }
  
            return false;
          });
  
          // If there are matching timings, calculate fare and add bus to the results
          if (matchingTimings.length > 0) {
            const timingsWithFare = matchingTimings.map((timing) => {
              if (timing.distance !== undefined) {
                return {
                  ...timing,
                  fare: calculateFare(bus, timing.distance),
                };
              }
              return timing;
            });
  
            results.push({
              ...bus,
              timings: timingsWithFare,
            });
          }
        });
  
        // Set the filtered buses to the search results state
        setSearchResults(results);
      } else {
        console.log('No data available');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error fetching route data:', error);
    }
  };
  

  return (
    <section id="search" className="py-16 bg-gradient-to-r from-blue-100 to-blue-50">
  <div className="container mx-auto px-4">
    <h3 className="text-3xl font-extrabold text-gray-800 mb-12 text-center">Search for Buses</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Bus Name Search Form */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 shadow-xl rounded-lg border border-gray-300 transition-transform transform">
        <h4 className="text-2xl font-semibold text-gray-800 mb-6">Bus Name Search</h4>
        <form onSubmit={handleBusSearch}>
          <div className="relative mb-6">
            <input 
              type="text" 
              placeholder="Enter Bus Name" 
              value={busName} 
              onChange={(e) => setBusName(e.target.value)}
              className="w-full p-4 border border-gray-400 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition focus:shadow-lg peer bg-transparent"
            />
            <label className="absolute left-3 -top-3.5 text-sm bg-white px-1 text-gray-500 transition-all peer-focus:text-teal-600 peer-focus:-top-3.5 peer-focus:text-sm">
              Bus Name
            </label>
          </div>
          <button 
            type="submit" 
            className="w-full bg-teal-600 text-white py-3 rounded-md shadow-lg hover:bg-teal-700 transition duration-300 ease-in-out"
          >
            Search Bus
          </button>
        </form>
      </div>

      {/* Route Wise Search Form */}
      <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-8 shadow-xl rounded-lg border border-gray-300 transition-transform transform">
        <h4 className="text-2xl font-semibold text-gray-800 mb-6">Route Wise Search</h4>
        <form onSubmit={handleRouteSearch}>
          {/* Start Location */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Enter Start Location"
              value={startLocation}
              onChange={handleStartLocationChange}
              onFocus={() => setShowStartSuggestions(true)}
              className="w-full p-4 border border-gray-400 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition focus:shadow-lg peer bg-transparent"
            />
            <label className="absolute left-3 -top-3.5 text-sm bg-white px-1 text-gray-500 transition-all peer-focus:text-teal-600 peer-focus:-top-3.5 peer-focus:text-sm">
              Start Location
            </label>
            {showStartSuggestions && (
              <ul
                ref={startSuggestionsRef}
                className="absolute z-10 bg-white border border-gray-400 rounded-md mt-1 w-full max-h-60 overflow-y-auto shadow-lg"
              >
                {filteredStartSuggestions.map((location, index) => (
                  <li
                    key={index}
                    onClick={() => handleStartLocationSelect(location)}
                    className="p-2 cursor-pointer hover:bg-teal-100"
                  >
                    {location}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* End Location */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Enter End Location"
              value={endLocation}
              onChange={handleEndLocationChange}
              onFocus={() => setShowEndSuggestions(true)}
              className="w-full p-4 border border-gray-400 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition focus:shadow-lg peer bg-transparent"
            />
            <label className="absolute left-3 -top-3.5 text-sm bg-white px-1 text-gray-500 transition-all peer-focus:text-teal-600 peer-focus:-top-3.5 peer-focus:text-sm">
              End Location
            </label>
            {showEndSuggestions && (
              <ul
                ref={endSuggestionsRef}
                className="absolute z-10 bg-white border border-gray-400 rounded-md mt-1 w-full max-h-60 overflow-y-auto shadow-lg"
              >
                {filteredEndSuggestions.map((location, index) => (
                  <li
                    key={index}
                    onClick={() => handleEndLocationSelect(location)}
                    className="p-2 cursor-pointer hover:bg-teal-100"
                  >
                    {location}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Time Range Inputs */}
          <div className="grid grid-cols-2 gap-6">
            <div className="relative">
              <input
                title='Start Time'
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-4 border border-gray-400 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition focus:shadow-lg peer bg-transparent"
              />
              <label className="absolute left-3 -top-3.5 text-sm bg-white px-1 text-gray-500 transition-all peer-focus:text-teal-600 peer-focus:-top-3.5 peer-focus:text-sm">
                Start Time
              </label>
            </div>
            <div className="relative">
              <input
                title='End Time'
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-4 border border-gray-400 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition focus:shadow-lg peer bg-transparent"
              />
              <label className="absolute left-3 -top-3.5 text-sm bg-white px-1 text-gray-500 transition-all peer-focus:text-teal-600 peer-focus:-top-3.5 peer-focus:text-sm">
                End Time
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-3 rounded-md shadow-lg hover:bg-teal-700 transition duration-300 ease-in-out mt-6"
          >
            Search Route
          </button>
        </form>
      </div>
    </div>

    {/* Search Results */}
    <div className="mt-12">
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {searchResults.map((bus, index) => (
            <div key={index} className="bg-gradient-to-r from-teal-50 via-cyan-100 to-cyan-200 p-6 rounded-lg shadow-lg">
              <h4 className="text-xl font-bold text-center text-gray-800 mb-2">{bus.busName.English}</h4>
              <p className="text-teal-600 mb-2">Type: {bus.busType}</p>
              <p className="text-teal-600 mb-2">Route: {bus.route.startLocation} to {bus.route.departureLocation}</p>
              <p className="text-teal-600 mb-2">Timings: {bus.timings.map((timing, idx) => (
                <p key={idx}>
                  {timing.start} - {timing.end} at {timing.time}
                  {timing.distance !== undefined && (
                    <>
                      <br />
                      Distance: {timing.distance} km
                      <br />
                      Fare: ₹{timing.fare}
                    </>
                  )}
                  {idx < bus.timings.length - 1 ? ', ' : ''}
                </p>
              ))}</p>
              <p className="text-pink-600 mb-2">Owner: {bus.ownerDetails.name} ({bus.ownerDetails.contact})</p>
              <p className="text-pink-600 mb-2">Price: {bus.priceDetails.perKmAdult} per km (Adult)</p>
              <div className='flex gap-4'>
                <img src={bus.images.front} alt="Bus Front" className="w-40 h-40 object-cover rounded-lg mt-4" />
                <img src={bus.images.rear} alt="Bus Rear" className="w-40 h-40 object-cover rounded-lg mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">No results found.</p>
      )}
    </div>
  </div>
</section>

  );
};

export default SearchSection;
