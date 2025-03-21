import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import filmImage from '../assets/404.jpg';
import { IoBookmarkOutline, IoBookmarkSharp } from 'react-icons/io5';

function Film({ favoris, setFavoris, setIsLoggedIn }) {
  const navigate = useNavigate();
  const [films, setFilms] = useState([]);
  const [favorisIds, setFavorisIds] = useState([]);
  const [vuIds, setVuIds] = useState([]);
  const [aVoirIds, setAVoirIds] = useState([]);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isUserLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    fetchData();
    if (isUserLoggedIn) {
      fetchUserLists();
    }
  }, [isUserLoggedIn]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchUserLists = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      const [favorisResponse, vusResponse, aVoirResponse] = await Promise.all([
        axios.get(`https://backmovies-8saw.onrender.com/favoris/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`https://backmovies-8saw.onrender.com/vu/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`https://backmovies-8saw.onrender.com/aVoir/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
      ]);

      setFavorisIds(favorisResponse.data.favoris.map(film => film._id));
      setVuIds(vusResponse.data.vus.map(film => film._id));
      setAVoirIds(aVoirResponse.data.vus.map(film => film._id));
    } catch (error) {
      console.error('Error fetching user lists:', error);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const filmResponse = await axios.get('https://backmovies-8saw.onrender.com/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const filmsWithImages = await Promise.all(
        filmResponse.data.map(async (film) => {
          try {
            const tmdbResponse = await axios.get('https://api.themoviedb.org/3/search/movie', {
              params: {
                api_key: '8f2731e0e3d71639abbc2418427bb30a',
                query: film.originalTitle
              }
            });

            if (tmdbResponse.data.results.length > 0) {
              const tmdbFilm = tmdbResponse.data.results[0];
              return {
                ...film,
                posterPath: tmdbFilm.poster_path
              };
            }
            return film;
          } catch (error) {
            console.error('Error fetching TMDB data:', error);
            return film;
          }
        })
      );

      setFilms(filmsWithImages);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavoris = async (filmId) => {
    if (!isUserLoggedIn) {
      navigate('/login');
      return;
    }

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    try {
      if (isFilmInFavoris(filmId)) {
        await axios.delete(`https://backmovies-8saw.onrender.com/favoris/remove/${userId}/${filmId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setFavorisIds(prev => prev.filter(id => id !== filmId));
      } else {
        await axios.post('https://backmovies-8saw.onrender.com/favorisPost/add', {
          userId: userId,
          movieId: filmId
        });
        setFavorisIds(prev => [...prev, filmId]);
      }
    } catch (error) {
      console.error('Error toggling favoris:', error);
    }
  };

  const handleToggleVu = async (filmId) => {
    if (!isUserLoggedIn) {
      navigate('/login');
      return;
    }

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    try {
      if (isFilmInVu(filmId)) {
        await axios.delete(`https://backmovies-8saw.onrender.com/vus/remove/${userId}/${filmId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setVuIds(prev => prev.filter(id => id !== filmId));
      } else {
        await axios.post('https://backmovies-8saw.onrender.com/vu/add', {
          userId: userId,
          movieId: filmId
        });
        setVuIds(prev => [...prev, filmId]);
      }
    } catch (error) {
      console.error('Error toggling vu:', error);
    }
  };

  const handleToggleAVoir = async (filmId) => {
    if (!isUserLoggedIn) {
      navigate('/login');
      return;
    }

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    try {
      if (isFilmInAVoir(filmId)) {
        await axios.delete(`https://backmovies-8saw.onrender.com/aVoir/remove/${userId}/${filmId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setAVoirIds(prev => prev.filter(id => id !== filmId));
      } else {
        await axios.post('https://backmovies-8saw.onrender.com/aVoir/voirAdd', {
          userId: userId,
          movieId: filmId
        });
        setAVoirIds(prev => [...prev, filmId]);
      }
    } catch (error) {
      console.error('Error toggling à voir:', error);
    }
  };

  const isFilmInFavoris = (filmId) => favorisIds.includes(filmId);
  const isFilmInVu = (filmId) => vuIds.includes(filmId);
  const isFilmInAVoir = (filmId) => aVoirIds.includes(filmId);

  const openPopup = (film) => {
    setSelectedFilm(film);
    setIsPopupOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedFilm(null);
    document.body.style.overflow = 'unset';
  };

  const handleCarouselImageClick = (film) => {
    openPopup(film);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const settings = {
    infinite: true,
    speed: 800,
    slidesToShow: 4,
    slidesToScroll: 1,
    centerMode: false,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Chargement des films...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto py-8 px-4 md:px-8 pt-24">
        <div className="mb-16">
          <h1 className="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Découvrez des Films Exceptionnels
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Explorez notre collection soigneusement sélectionnée
          </p>
          <div className="relative">
            <Slider {...settings} className="carousel-container">
              {films.map((film) => (
                <div key={film._id} className="px-2 transform transition-transform duration-300 hover:scale-105">
                  <div className="relative group cursor-pointer" onClick={() => handleCarouselImageClick(film)}>
                    <img 
                      src={film.posterPath ? `https://image.tmdb.org/t/p/w500/${film.posterPath}` : filmImage}
                      alt={film.originalTitle}
                      className="w-full h-[400px] object-cover rounded-lg shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 rounded-lg flex items-center justify-center">
                      <p className="text-white opacity-0 group-hover:opacity-100 text-center px-4 font-semibold transition-opacity duration-300">
                        {film.originalTitle}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Catalogue Complet</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {films.map((film) => (
              <div key={film._id} className="bg-gray-800 rounded-xl overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="relative">
                  <img
                    src={film.posterPath ? `https://image.tmdb.org/t/p/w500/${film.posterPath}` : filmImage}
                    alt={film.originalTitle}
                    className="w-full h-[300px] object-cover"
                    onClick={() => openPopup(film)}
                  />
                  {isUserLoggedIn && (
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleFavoris(film._id); }}
                        className={`p-2 rounded-full backdrop-blur-md ${isFilmInFavoris(film._id) ? 'bg-red-500/90' : 'bg-gray-800/90'} transition-colors duration-300`}
                      >
                        {isFilmInFavoris(film._id) ? <IoBookmarkSharp size={20} /> : <IoBookmarkOutline size={20} />}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{film.originalTitle}</h3>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Réalisé par {film.director}</p>
                    <p>{film.years} • {film.time}</p>
                    <p className="text-blue-400">{film.gender}</p>
                  </div>
                  
                  {isUserLoggedIn && (
                    <div className="flex justify-between mt-4 gap-2">
                      <button
                        onClick={() => handleToggleVu(film._id)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-300 ${
                          isFilmInVu(film._id) ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        {isFilmInVu(film._id) ? 'Vu' : 'Marquer comme vu'}
                      </button>
                      <button
                        onClick={() => handleToggleAVoir(film._id)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-300 ${
                          isFilmInAVoir(film._id) ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        {isFilmInAVoir(film._id) ? 'À voir' : 'À voir plus tard'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showScrollButton && (
        <button
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
          onClick={scrollToTop}
        >
          ↑
        </button>
      )}

      {isPopupOpen && selectedFilm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50 backdrop-blur-sm" onClick={closePopup}>
          <div
            className="bg-gray-900 text-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={selectedFilm.posterPath ? `https://image.tmdb.org/t/p/w500${selectedFilm.posterPath}` : filmImage}
                alt={selectedFilm.originalTitle}
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-2xl font-bold mb-2">{selectedFilm.originalTitle}</h3>
                <p className="text-gray-300">{selectedFilm.years} • {selectedFilm.time} • {selectedFilm.gender}</p>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-300 leading-relaxed mb-6">{selectedFilm.synopsis}</p>
              
              {isUserLoggedIn && (
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={() => handleToggleFavoris(selectedFilm._id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300 ${
                      isFilmInFavoris(selectedFilm._id) ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {isFilmInFavoris(selectedFilm._id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  </button>
                  <button
                    onClick={() => handleToggleVu(selectedFilm._id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300 ${
                      isFilmInVu(selectedFilm._id) ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {isFilmInVu(selectedFilm._id) ? 'Marquer comme non vu' : 'Marquer comme vu'}
                  </button>
                  <button
                    onClick={() => handleToggleAVoir(selectedFilm._id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300 ${
                      isFilmInAVoir(selectedFilm._id) ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {isFilmInAVoir(selectedFilm._id) ? 'Retirer de la liste' : 'À voir plus tard'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Film;