import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

function SearchResult() {
    const location = useLocation();
    const searchTerms = JSON.parse(decodeURIComponent(location.pathname.split('/').pop()));

    const [searchResultsWithImages, setSearchResultsWithImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFilmData = async () => {
            try {
                const filmDataWithImages = await Promise.all(
                    searchTerms.map(async (term) => {
                        try {
                            const tmdbResponse = await axios.get('https://api.themoviedb.org/3/search/movie', {
                                params: {
                                    api_key: '8f2731e0e3d71639abbc2418427bb30a',
                                    query: term.originalTitle
                                }
                            });

                            if (tmdbResponse.data.results.length > 0) {
                                const tmdbFilm = tmdbResponse.data.results[0];
                                return {
                                    ...term,
                                    posterPath: tmdbFilm.poster_path
                                };
                            } else {
                                return term;
                            }
                        } catch (error) {
                            console.error('Erreur lors de la récupération des données TMDB :', error);
                            return term;
                        }
                    })
                );

                // Filtrer les doublons en utilisant un Set
                const uniqueResults = Array.from(new Map(
                    filmDataWithImages.map(item => [item.originalTitle, item]) // Utiliser `originalTitle` comme clé unique
                ).values());

                setSearchResultsWithImages(uniqueResults);
                setIsLoading(false);
            } catch (error) {
                console.error('Erreur lors de la récupération des données :', error);
                setIsLoading(false);
            }
        };

        fetchFilmData();
    }, [searchTerms]);

    return (
        <div>
            <div className="bg-gray-900 text-white min-h-screen pt-16">
                <div className="container mx-auto py-8 px-4">
                    <h1 className="text-3xl font-bold mb-8 text-center">Résultats de la recherche</h1>
                    {isLoading ? (
                        <p className="text-center">Chargement...</p>
                    ) : searchResultsWithImages.length === 0 ? (
                        <p className="text-center">Aucun résultat trouvé.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchResultsWithImages.map((result, index) => (
                                <div key={index} className="bg-gray-800 shadow-md rounded-lg p-4 border border-gray-700">
                                    <div>
                                        {result.posterPath && (
                                            <img src={`https://image.tmdb.org/t/p/w500/${result.posterPath}`} alt={result.originalTitle} className="mt-4 w-full rounded-lg shadow-lg" />
                                        )}
                                        <h3 className="text-lg font-bold my-2">{result.originalTitle}</h3>
                                        <p className="text-sm">Réalisateur : {result.director}</p>
                                        <p className="text-sm">Année : {result.years}</p>
                                        <p className="text-sm">Pays : {result.country}</p>
                                        <p className="text-sm">Résumé : {result.synopsis}</p>
                                        <p className="text-sm">Catégorie : {result.gender}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SearchResult;
