import React, { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Home, Music, Theater } from 'lucide-react';

function Map({ userLocation, setIsLoggedIn }) {
  const [festivals, setFestivals] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedFestivalIndex, setSelectedFestivalIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  console.log(userLocation)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userLocation) return;
        const { latitude, longitude } = userLocation;
        console.log(latitude,longitude)
        setLoading(true);
        const response = await axios.get(`https://backmovies-8saw.onrender.com/festivalOne/${latitude}/${longitude}`);
        setFestivals(response.data);
        setDataLoaded(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userLocation]);

  useEffect(() => {
    if (dataLoaded && festivals.length > 0) {
      setSelectedFestivalIndex(0);
      handleMarkerClick([festivals[0].geocodage_xy.lat, festivals[0].geocodage_xy.lon], 0);
    }
  }, [dataLoaded, festivals]);

  const handleMarkerClick = (position, index) => {
    setSelectedFestivalIndex(index);
    if (mapRef.current) {
      mapRef.current.flyTo(position, 16, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  };

  const handleDataItemClick = (index) => {
    setSelectedFestivalIndex(index);
    const festival = festivals[index];
    if (mapRef.current && festival) {
      mapRef.current.flyTo(
        [festival.geocodage_xy.lat, festival.geocodage_xy.lon],
        16,
        {
          duration: 1.5,
          easeLinearity: 0.25
        }
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Chargement des festivals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="h-[60vh] relative border-b border-gray-700 shadow-2xl">
        {userLocation ? (
          <MapContainer
            center={[userLocation.latitude, userLocation.longitude]}
            zoom={12}
            className="h-full w-full"
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {festivals.map((festival, index) => (
              <Marker
                key={index}
                position={[festival.geocodage_xy.lat, festival.geocodage_xy.lon]}
                eventHandlers={{
                  click: () => handleMarkerClick([festival.geocodage_xy.lat, festival.geocodage_xy.lon], index)
                }}
              >
                <Popup>
                  <div className="p-4 min-w-[300px]">
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{festival.nom_du_festival}</h3>
                    <div className="space-y-2">
                      {festival.adresse_postale && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-5 h-5 mt-1 text-gray-600 flex-shrink-0" />
                          <p className="text-gray-700">{festival.adresse_postale}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Home className="w-5 h-5 text-gray-600" />
                        <p className="text-gray-700">{festival.commune_principale_de_deroulement}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <p className="text-gray-700">Créé en {festival.annee_de_creation_du_festival}</p>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="flex justify-center items-center h-full bg-gray-900/50 px-4">
            <div className="text-center max-w-lg">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-white animate-bounce" />
              <p className="text-lg">
                Votre position n'est pas disponible. Veuillez activer la localisation et recharger la page pour découvrir les festivals à proximité.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="h-[40vh] overflow-y-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {festivals.map((festival, index) => (
            <div
              key={index}
              onClick={() => handleDataItemClick(index)}
              className={`
                rounded-xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]
                ${selectedFestivalIndex === index 
                  ? 'bg-blue-600 shadow-lg ring-2 ring-blue-400' 
                  : 'bg-gray-800 hover:bg-gray-700'}
              `}
            >
              <h3 className="text-xl font-bold mb-4 line-clamp-2">{festival.nom_du_festival}</h3>
              <div className="space-y-3">
                {festival.adresse_postale && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                    <p className="text-sm text-gray-300 line-clamp-2">{festival.adresse_postale}</p>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5" />
                  <p className="text-sm text-gray-300">{festival.commune_principale_de_deroulement}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5" />
                  <p className="text-sm text-gray-300">Créé en {festival.annee_de_creation_du_festival}</p>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-700">
                  <p className="text-sm font-medium text-gray-300">
                    {festival.discipline_dominante}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {festival.departement_principal_de_deroulement}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Map;