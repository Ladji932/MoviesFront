import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Assure-toi que `Link` est importé

function Voir({ setIsLoggedIn }) {
  const [voir, setVoir] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const isUserLoggedIn = !!localStorage.getItem('token'); // Vérifie si l'utilisateur est connecté

  useEffect(() => {
    if (!isUserLoggedIn) {
      setIsLoading(false); // Mettre à jour le chargement une fois la vérification terminée
      return; // Ne pas exécuter la requête si l'utilisateur n'est pas connecté
    }

    const fetchVoir = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (!userId || !token) {
          return;
        }

        const response = await axios.get(`https://backmovies-8saw.onrender.com/getVoirMovies/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const voirWithImages = await Promise.all(
          response.data.vus.map(async (film) => {
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
              } else {
                return film;
              }
            } catch (error) {
              console.error('Error fetching TMDB data:', error);
              return film;
            }
          })
        );

        setVoir(voirWithImages);
      } catch (error) {
        console.error('Error fetching voir:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoir();
  }, [isUserLoggedIn]); // Re-exécuter l'effet lorsque l'état de connexion change

  const handleRemoveVoir = async (filmId) => {
    try {
      const userId = localStorage.getItem('userId');
      await axios.delete(`https://backmovies-8saw.onrender.com/aVoir/remove/${userId}/${filmId}`);
      setVoir(prevVoir => prevVoir.filter(film => film._id !== filmId));
    } catch (error) {
      console.error('Error removing from voir:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div className='voir bg-gray-900 text-white min-h-screen pt-16'>
      <div className="container mx-auto py-8 p-10">
        <h1 className="text-3xl font-bold mb-4">Films à voir</h1>
        {isLoading ? (
          <p className="text-center text-xl">Chargement...</p>
        ) : !isUserLoggedIn ? (
          <div className="text-center">
            <p className="text-xl mb-4">Veuillez vous connecter pour ajouter des films à voir.</p>
            <div>
              <Link to="/login" className="inline-block text-sm bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2">
                Se connecter
              </Link>
              <Link to="/inscription" className="inline-block text-sm bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded">
                S'inscrire
              </Link>
            </div>
          </div>
        ) : voir.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {voir.map((film) => (
              <li key={film._id} className="bg-gray-800 shadow-lg rounded-lg p-4 border border-gray-700">
                <div>
                  {film.posterPath && (
                    <img src={`https://image.tmdb.org/t/p/w500/${film.posterPath}`} alt={film.originalTitle} className="mt-4 w-full rounded-lg shadow-md" />
                  )}
                  <p className="text-lg font-semibold mt-2">Titre original: {film.originalTitle}</p>
                  <p>Pays: {film.country}</p>
                  <p>Genre: {film.gender}</p>
                  <p>Résumé: {film.synopsis}</p>
                  <p>Temps: {film.time}</p>
                  <button onClick={() => handleRemoveVoir(film._id)} className="bg-red-500 text-white px-4 py-2 rounded-md mt-4 hover:bg-red-600 focus:outline-none">
                    Supprimer de la liste à voir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-xl">Aucun film à voir</p>
        )}
      </div>
    </div>
  );
}

export default Voir;
