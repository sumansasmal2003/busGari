import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { set, ref as dbRef, get } from 'firebase/database';
import { storage, db, auth } from '../firebaseConfig'; // Adjust the path accordingly
import { v4 as uuidv4 } from 'uuid';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import '@fontsource/poppins';

interface BusName {
  English: string;
  Bengali: string;
  Hindi: string;
}

interface BusRoute {
  startLocation: string;
  departureLocation: string;
  intermediateStops: string[];
}

interface BusTimings {
  start: string;
  end: string;
  time: string;
  distance?: number;
  fare?: number;
}

interface BusImages {
  front: string;
  rear: string;
}

interface BusOwnerDetails {
  name: string;
  contact: string;
  address: string;
}

interface BusPriceDetails {
  perKmAdult: number;
  perKmNonAdult: number;
}

interface BusData {
  busName: BusName;
  route: BusRoute;
  timings: BusTimings[];
  images: BusImages;
  registrationNumber: string;
  busType: string;
  seatingCapacity: number;
  ownerDetails: BusOwnerDetails;
  priceDetails: BusPriceDetails;
  email: string;
}

type BusesRecord = Record<string, BusData>;


const BusRegistrationPage: React.FC = () => {
  const [busNameEnglish, setBusNameEnglish] = useState('');
  const [busNameBengali, setBusNameBengali] = useState('');
  const [busNameHindi, setBusNameHindi] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [departureLocation, setDepartureLocation] = useState('');
  const [intermediateStops, setIntermediateStops] = useState<string[]>(['']);
  const [startTimes, setStartTimes] = useState<{ time: string, start: string, end: string }[]>([]);
  const [busFrontImage, setBusFrontImage] = useState<File | null>(null);
  const [busRearImage, setBusRearImage] = useState<File | null>(null);
  const [registrationNumber, setRegistrationNumber] = useState('');

  const [busType, setBusType] = useState('AC'); // Default to 'AC'
  const [seatingCapacity, setSeatingCapacity] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');

  const [pricePerKmAdult, setPricePerKmAdult] = useState('');
  const [pricePerKmNonAdult, setPricePerKmNonAdult] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAddStop = () => {
    setIntermediateStops([...intermediateStops, '']);
  };

  const handleRemoveStop = (index: number) => {
    setIntermediateStops(intermediateStops.filter((_, i) => i !== index));
  };

  const handleChangeStop = (index: number, value: string) => {
    const newStops = [...intermediateStops];
    newStops[index] = value;
    setIntermediateStops(newStops);
  };

  const handleAddTime = () => {
    setStartTimes([...startTimes, { time: '', start: '', end: '' }]);
  };

  const handleChangeTime = (index: number, field: keyof typeof startTimes[0], value: string) => {
    const newTimes = [...startTimes];
    newTimes[index][field] = value;
    setStartTimes(newTimes);
  };

  const handleFrontImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setBusFrontImage(event.target.files[0]);
    }
  };

  const handleRearImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setBusRearImage(event.target.files[0]);
    }
  };

  const uploadImage = async (file: File, path: string) => {
    const imageRef = ref(storage, path);
    await uploadBytes(imageRef, file);
    return getDownloadURL(imageRef);
  };

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
  
    if (!validatePassword(password)) {
      alert('Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }
  
    try {
      // Check if bus name already exists
      const busesRef = dbRef(db, 'buses');
      const snapshot = await get(busesRef);
      const buses = snapshot.val() as BusesRecord | null;
  
      if (buses) {
        const nameExists = Object.values(buses).some(bus => 
          bus.busName.English.toLowerCase() === busNameEnglish.toLowerCase()
        );
  
        if (nameExists) {
          const userConfirmed = window.confirm('A bus with this name already exists. Do you want to continue? Press OK to continue or Cancel to abort.');
  
          if (!userConfirmed) {
            return;
          }
        }
      }
  
      // Create a new user with email and password
      await createUserWithEmailAndPassword(auth, email, password);
  
      // Generate a unique ID for the bus
      const busId = uuidv4();
  
      // Upload images and get their URLs
      const frontImageUrl = busFrontImage ? await uploadImage(busFrontImage, `buses/front/${busId}`) : '';
      const rearImageUrl = busRearImage ? await uploadImage(busRearImage, `buses/rear/${busId}`) : '';
  
      // Save bus data to Realtime Database
      await set(dbRef(db, 'buses/' + busId), {
        busName: {
          English: busNameEnglish,
          Bengali: busNameBengali,
          Hindi: busNameHindi
        },
        route: {
          startLocation,
          departureLocation,
          intermediateStops
        },
        timings: startTimes,
        images: {
          front: frontImageUrl,
          rear: rearImageUrl
        },
        registrationNumber,
        busType,
        seatingCapacity: parseInt(seatingCapacity, 10),
        ownerDetails: {
          name: ownerName,
          contact: ownerContact,
          address: ownerAddress
        },
        priceDetails: {
          perKmAdult: parseFloat(pricePerKmAdult),
          perKmNonAdult: parseFloat(pricePerKmNonAdult)
        },
        email
      });
  
      // Reset form
      setBusNameEnglish('');
      setBusNameBengali('');
      setBusNameHindi('');
      setStartLocation('');
      setDepartureLocation('');
      setIntermediateStops(['']);
      setStartTimes([]);
      setBusFrontImage(null);
      setBusRearImage(null);
      setRegistrationNumber('');
      setBusType('AC');
      setSeatingCapacity('');
      setOwnerName('');
      setOwnerContact('');
      setOwnerAddress('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
  
      alert('Bus registered successfully!');
    } catch (error) {
      console.error('Error uploading data:', error);
      alert('Failed to register bus.');
    }
  };

  return (
    <section 
      className="py-16 bg-gradient-to-r from-blue-50 to-blue-100"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-10 text-center">Register a New Bus</h1>
        <form onSubmit={handleSubmit} className="bg-gradient-to-r from-blue-100 to-blue-50 p-8 shadow-lg rounded-lg space-y-8">
          {/* Bus Name Inputs */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bus Name</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="busNameEnglish" className="block text-gray-700 mb-1">English</label>
                <input
                  id="busNameEnglish"
                  type="text"
                  value={busNameEnglish}
                  onChange={(e) => setBusNameEnglish(e.target.value)}
                  placeholder="Enter bus name in English"
                  className="w-full p-3 border border-gray-300 rounded-md"
                  title="Enter the bus name in English"
                />
              </div>
              <div>
                <label htmlFor="busNameBengali" className="block text-gray-700 mb-1">Bengali</label>
                <input
                  id="busNameBengali"
                  type="text"
                  value={busNameBengali}
                  onChange={(e) => setBusNameBengali(e.target.value)}
                  placeholder="Enter bus name in Bengali"
                  className="w-full p-3 border border-gray-300 rounded-md"
                  title="Enter the bus name in Bengali"
                />
              </div>
              <div>
                <label htmlFor="busNameHindi" className="block text-gray-700 mb-1">Hindi</label>
                <input
                  id="busNameHindi"
                  type="text"
                  value={busNameHindi}
                  onChange={(e) => setBusNameHindi(e.target.value)}
                  placeholder="Enter bus name in Hindi"
                  className="w-full p-3 border border-gray-300 rounded-md"
                  title="Enter the bus name in Hindi"
                />
              </div>
            </div>
          </div>

          {/* Bus Type or Model */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bus Type or Model</h2>
            <div>
              <label htmlFor="busType" className="block text-gray-700 mb-1">Select Bus Type</label>
              <select
                id="busType"
                value={busType}
                onChange={(e) => setBusType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                title="Select the bus type or model"
              >
                <option value="AC">AC</option>
                <option value="Non-AC">Non-AC</option>
                <option value="Sleeper">Sleeper</option>
                <option value="Seater">Seater</option>
              </select>
            </div>
          </div>

          {/* Seating Capacity */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Seating Capacity</h2>
            <div>
              <label htmlFor="seatingCapacity" className="block text-gray-700 mb-1">Enter Seating Capacity</label>
              <input
                id="seatingCapacity"
                type="number"
                value={seatingCapacity}
                onChange={(e) => setSeatingCapacity(e.target.value)}
                placeholder="Enter seating capacity"
                className="w-full p-3 border border-gray-300 rounded-md"
                title="Enter the seating capacity of the bus"
              />
            </div>
          </div>

          {/* Bus Route */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bus Route</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="startLocation" className="block text-gray-700 mb-1">Starting Location</label>
                <input
                  id="startLocation"
                  type="text"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  placeholder="Enter starting location"
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="departureLocation" className="block text-gray-700 mb-1">Departure Location</label>
                <input
                  id="departureLocation"
                  type="text"
                  value={departureLocation}
                  onChange={(e) => setDepartureLocation(e.target.value)}
                  placeholder="Enter departure location"
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">Intermediate Stops</h3>
                {intermediateStops.map((stop, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={stop}
                      onChange={(e) => handleChangeStop(index, e.target.value)}
                      placeholder={`Stop ${index + 1}`}
                      className="w-full p-3 border border-gray-300 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(index)}
                      className="p-2 bg-gradient-to-r from-pink-500 to-pink-700 text-white rounded-md"
                      title="Remove this stop"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddStop}
                  className="p-3 bg-gradient-to-r from-blue-300 via-violet-500 to-blue-700 text-gray-50 rounded-md"
                  title="Add a new stop"
                >
                  Add Stop
                </button>
              </div>
            </div>
          </div>

          {/* Timings */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bus Timings</h2>
            <div className="space-y-4">
              {startTimes.map((time, index) => (
                <div key={index} className="grid grid-cols-3 gap-4">
                  <input
                    type="time"
                    value={time.time}
                    onChange={(e) => handleChangeTime(index, 'time', e.target.value)}
                    placeholder="Time"
                    className="w-full p-3 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={time.start}
                    onChange={(e) => handleChangeTime(index, 'start', e.target.value)}
                    placeholder="Start Location"
                    className="w-full p-3 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={time.end}
                    onChange={(e) => handleChangeTime(index, 'end', e.target.value)}
                    placeholder="End Location"
                    className="w-full p-3 border border-gray-300 rounded-md"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddTime}
                className="p-3 bg-gradient-to-r from-blue-300 via-purple-500 to-blue-700 text-white rounded-md"
                title="Add a new timing"
              >
                Add Timing
              </button>
            </div>
          </div>

          {/* Bus Images */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bus Images</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="busFrontImage" className="block text-gray-700 mb-1">Front Image</label>
                <input
                  id="busFrontImage"
                  type="file"
                  onChange={handleFrontImageChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="busRearImage" className="block text-gray-700 mb-1">Rear Image</label>
                <input
                  id="busRearImage"
                  type="file"
                  onChange={handleRearImageChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Registration Number */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Registration Number</h2>
            <div>
              <label htmlFor="registrationNumber" className="block text-gray-700 mb-1">Enter Registration Number</label>
              <input
                id="registrationNumber"
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="Enter registration number"
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Price Details */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Price Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pricePerKmAdult" className="block text-gray-700 mb-1">Price per Km (Adult)</label>
                <input
                  id="pricePerKmAdult"
                  type="text"
                  value={pricePerKmAdult}
                  onChange={(e) => setPricePerKmAdult(e.target.value)}
                  placeholder="Enter price per km for adults"
                  className="w-full p-3 border border-gray-300 rounded-md"
                  title="Enter the price per kilometer for adult passengers"
                />
              </div>
              <div>
                <label htmlFor="pricePerKmNonAdult" className="block text-gray-700 mb-1">Price per Km (Non-Adult)</label>
                <input
                  id="pricePerKmNonAdult"
                  type="text"
                  value={pricePerKmNonAdult}
                  onChange={(e) => setPricePerKmNonAdult(e.target.value)}
                  placeholder="Enter price per km for non-adults"
                  className="w-full p-3 border border-gray-300 rounded-md"
                  title="Enter the price per kilometer for non-adult passengers"
                />
              </div>
            </div>
          </div>

          {/* Bus Owner Details */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bus Owner Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="ownerName" className="block text-gray-700 mb-1">Owner Name</label>
                <input
                  id="ownerName"
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Enter owner's name"
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="ownerContact" className="block text-gray-700 mb-1">Owner Contact Number</label>
                <input
                  id="ownerContact"
                  type="text"
                  value={ownerContact}
                  onChange={(e) => setOwnerContact(e.target.value)}
                  placeholder="Enter owner's contact number"
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="ownerAddress" className="block text-gray-700 mb-1">Owner Address</label>
                <input
                  id="ownerAddress"
                  type="text"
                  value={ownerAddress}
                  onChange={(e) => setOwnerAddress(e.target.value)}
                  placeholder="Enter owner's address"
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Email and Password */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Account Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-gray-700 mb-1">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-gray-700 mb-1">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="p-4 bg-gradient-to-r from-blue-300 via-violet-500 to-blue-700 text-white font-semibold rounded-md w-full"
            >
              Register Bus
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default BusRegistrationPage;
