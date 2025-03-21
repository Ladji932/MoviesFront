import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Film from './components/film';
import SignupForm from './components/SignupForm';
import Home from './home';
import Favoris from "./components/Favoris";
import Vu from "./components/Vu";
import SearchResult from "./components/SearchResult"; 
import 'tailwindcss/tailwind.css';
import Voir from './components/Voir';
import Map from './components/Map';
import Header from './components/header';



function App() {
  const [favoris, setFavoris] = useState(() => {
    const favorisFromStorage = localStorage.getItem('favoris');
    return favorisFromStorage ? JSON.parse(favorisFromStorage) : [];
  });

  const [userLocation, setUserLocation] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        navigator.geolocation.getCurrentPosition(function (position) {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setUserLocation({ latitude: latitude, longitude: longitude });
        });
      } catch (error) {
        console.error(error);
        alert("Merci d'activer votre localisation pour utiliser cette fonctionnalité.");
      }
    };

    getUserLocation();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.setItem('isLoggedIn', 'false');
    window.location.reload();
  };

  return (
    <BrowserRouter>
      <div>
        <Header handleLogout={handleLogout} setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} />
        <Routes>
          <Route path='/login' element={<Home />} />
          <Route path='/' element={<Film favoris={favoris} setFavoris={setFavoris} userLocation={userLocation}  setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} />} />
          <Route path='/favoris' element={<Favoris favoris={favoris} />} />
          <Route path='/vus' element={<Vu />} />
          <Route path='/voir' element={<Voir />} />
          <Route path='/map' element={<Map userLocation={userLocation} />} />
          <Route path='/search-results/:searchTerm' element={<SearchResult />} />
          <Route path='/inscription' element={<SignupForm />} />
          <Route path='/*' element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
