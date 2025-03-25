import React, { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Home, 
  Globe, 
  Mail, 
  Building, 
  Film, 
  Music, 
  Book, 
  Theater,
  Info,
  MapPinned,
  Clock
} from 'lucide-react';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function Map({ userLocation, setIsLoggedIn }) {
  const [festivals, setFestivals] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedFestivalIndex, setSelectedFestivalIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userLocation) return;
        const { latitude, longitude } = userLocation;
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

  const getFullAddress = (festival) => {
    const parts = [];
    if (festival.numero_de_voie) parts.push(festival.numero_de_voie);
    if (festival.type_de_voie_rue_avenue_boulevard_etc) parts.push(festival.type_de_voie_rue_avenue_boulevard_etc);
    if (festival.nom_de_la_voie) parts.push(festival.nom_de_la_voie);
    if (festival.complement_d_adresse_facultatif) parts.push(festival.complement_d_adresse_facultatif);
    if (festival.code_postal_de_la_commune_principale_de_deroulement) {
      parts.push(festival.code_postal_de_la_commune_principale_de_deroulement);
    }
    if (festival.commune_principale_de_deroulement) {
      parts.push(festival.commune_principale_de_deroulement);
    }
    return parts.join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-blue-500/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-[42%] bg-blue-500 rounded-full"></div>
          </div>
          <div className="mt-8 space-y-2">
            <p className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Chargement des festivals
            </p>
            <p className="text-sm text-gray-400">Découvrez les événements près de chez vous</p>
          </div>
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
                icon={customIcon}
                eventHandlers={{
                  click: () => handleMarkerClick([festival.geocodage_xy.lat, festival.geocodage_xy.lon], index)
                }}
              >
                <Popup>
                  <div className="p-4 min-w-[300px]">
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{festival.nom_du_festival}</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-5 h-5 mt-1 text-gray-600 flex-shrink-0" />
                        <p className="text-gray-700">{getFullAddress(festival)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-gray-600" />
                        <p className="text-gray-700">{festival.libelle_epci_collage_en_valeur}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <p className="text-gray-700">{festival.periode_principale_de_deroulement_du_festival}</p>
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
                <div className="flex items-start gap-3">
                  <MapPinned className="w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-300 line-clamp-2">{getFullAddress(festival)}</p>
                    <p className="text-xs text-gray-400 mt-1">{festival.code_postal_de_la_commune_principale_de_deroulement}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" />
                  <p className="text-sm text-gray-300">{festival.periode_principale_de_deroulement_du_festival || 'Période non spécifiée'}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5" />
                  <div>
                    <p className="text-sm text-gray-300">{festival.libelle_epci_collage_en_valeur}</p>
                    <p className="text-xs text-gray-400">{festival.departement_principal_de_deroulement}</p>
                  </div>
                </div>

                {festival.discipline_dominante && (
                  <div className="flex items-center gap-3">
                    {festival.discipline_dominante.includes('Cinéma') ? (
                      <Film className="w-5 h-5" />
                    ) : festival.discipline_dominante.includes('Musique') ? (
                      <Music className="w-5 h-5" />
                    ) : festival.discipline_dominante.includes('Livre') ? (
                      <Book className="w-5 h-5" />
                    ) : festival.discipline_dominante.includes('Spectacle') ? (
                      <Theater className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                    <p className="text-sm text-gray-300">{festival.discipline_dominante}</p>
                  </div>
                )}

                {festival.site_internet_du_festival && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5" />
                    <a 
                      href={festival.site_internet_du_festival}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Site web
                    </a>
                  </div>
                )}

                {festival.adresse_e_mail && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" />
                    <a 
                      href={`mailto:${festival.adresse_e_mail}`}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Contact
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Map;