import { useMemo, useState, type ReactNode } from 'react';
import { MapPin, Calendar, Users, Clock } from 'lucide-react';
import { rideApi } from '../lib/api';
import { Autocomplete, GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

type LatLng = { lat: number; lng: number };

export default function OfferRide() {
  const [formData, setFormData] = useState({ destination: '', pickupLocation: '', departureDate: '', departureTime: '', totalSeats: '1' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mapCenter, setMapCenter] = useState<LatLng>({ lat: 45.6026, lng: -94.3634 });
  const [destMarker, setDestMarker] = useState<LatLng | null>(null);
  const [pickupMarker, setPickupMarker] = useState<LatLng | null>(null);
  const [destAutocomplete, setDestAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [pickupAutocomplete, setPickupAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const libraries = useMemo(() => ['places'] as ('places')[], []);
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, libraries });

  const popularDestinations = ['Minneapolis', 'St. Paul', 'St. Cloud', 'Mall of America', 'MSP Airport', 'College of Saint Benedict', "Saint John's University MN"];
  const popularPickups = ['Saint Johns University MN', 'College of Saint Benedict', 'MSP Airport', 'Mall of America'];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  };

  const geocodeAddress = async (address: string, field: 'destination' | 'pickupLocation') => {
    if (!window.google || !address.trim()) return;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const loc = results[0].geometry.location;
        const point = { lat: loc.lat(), lng: loc.lng() };
        setMapCenter(point);
        if (field === 'destination') setDestMarker(point);
        else setPickupMarker(point);
        handleChange(field, results[0].formatted_address || address);
      }
    });
  };

  const applyPlace = (place: google.maps.places.PlaceResult | undefined, field: 'destination' | 'pickupLocation') => {
    const formatted = place?.formatted_address || place?.name || '';
    if (!formatted) return;
    handleChange(field, formatted);
    const loc = place?.geometry?.location;
    if (loc) {
      const point = { lat: loc.lat(), lng: loc.lng() };
      setMapCenter(point);
      if (field === 'destination') setDestMarker(point);
      else setPickupMarker(point);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const departure_time = new Date(`${formData.departureDate}T${formData.departureTime}`).toISOString();
      await rideApi.create({
        destination: formData.destination,
        pickup_location: formData.pickupLocation,
        departure_time,
        total_seats: Number(formData.totalSeats),
      });
      setSuccess(true);
      setFormData({ destination: '', pickupLocation: '', departureDate: '', departureTime: '', totalSeats: '1' });
      setDestMarker(null); setPickupMarker(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to post ride.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Offer a Ride</h2>
        <p className="text-gray-600 mt-1">Share your journey with fellow students</p>
      </div>
      {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">Ride posted successfully.</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <PlaceInput label="Destination" value={formData.destination} setAutocomplete={setDestAutocomplete} autocomplete={destAutocomplete} isLoaded={isLoaded} onChange={(v) => handleChange('destination', v)} onSelect={() => applyPlace(destAutocomplete?.getPlace?.(), 'destination')} onBlur={() => geocodeAddress(formData.destination, 'destination')} suggestions={popularDestinations} onSuggestion={(value) => geocodeAddress(value, 'destination')} />
        <PlaceInput label="Pickup Location" value={formData.pickupLocation} setAutocomplete={setPickupAutocomplete} autocomplete={pickupAutocomplete} isLoaded={isLoaded} onChange={(v) => handleChange('pickupLocation', v)} onSelect={() => applyPlace(pickupAutocomplete?.getPlace?.(), 'pickupLocation')} onBlur={() => geocodeAddress(formData.pickupLocation, 'pickupLocation')} suggestions={popularPickups} onSuggestion={(value) => geocodeAddress(value, 'pickupLocation')} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Departure Date" icon={<Calendar className="w-4 h-4 text-[#7EC8E3]" />}><input type="date" value={formData.departureDate} onChange={(e) => handleChange('departureDate', e.target.value)} min={new Date().toISOString().split('T')[0]} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" /></Field>
          <Field label="Departure Time" icon={<Clock className="w-4 h-4 text-gray-500" />}><input type="time" value={formData.departureTime} onChange={(e) => handleChange('departureTime', e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" /></Field>
          <Field label="Seats" icon={<Users className="w-4 h-4 text-[#C41E3A]" />}><select value={formData.totalSeats} onChange={(e) => handleChange('totalSeats', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg">{[1,2,3,4,5,6].map((n)=><option key={n}>{n}</option>)}</select></Field>
        </div>

        {isLoaded && (
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <GoogleMap mapContainerStyle={{ width: '100%', height: '260px' }} center={mapCenter} zoom={8}>
              {pickupMarker && <Marker position={pickupMarker} label="P" />}
              {destMarker && <Marker position={destMarker} label="D" />}
            </GoogleMap>
          </div>
        )}

        <button disabled={loading} type="submit" className="w-full bg-[#C41E3A] text-white py-3 rounded-lg font-medium hover:bg-[#A01828] transition disabled:opacity-50">{loading ? 'Posting...' : 'Post Ride'}</button>
      </form>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return <div><label className="block text-sm font-medium text-gray-700 mb-2">{label}</label><div className="flex items-center gap-2 mb-2">{icon}</div>{children}</div>;
}

function PlaceInput({ label, value, onChange, isLoaded, setAutocomplete, onSelect, onBlur, suggestions, onSuggestion }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {!isLoaded ? (
        <input value={value} onChange={(e) => onChange(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
      ) : (
        <Autocomplete onLoad={setAutocomplete} onPlaceChanged={onSelect}>
          <input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
        </Autocomplete>
      )}
      <div className="flex flex-wrap gap-2 mt-3">{suggestions.map((s: string) => <button key={s} type="button" onClick={() => onSuggestion(s)} className="px-3 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">{s}</button>)}</div>
      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500"><MapPin className="w-4 h-4 text-gray-400" /><span>Search with Google Places or pick a common destination.</span></div>
    </div>
  );
}
