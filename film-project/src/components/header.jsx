import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Menu, LogOut, Home, Heart, Eye, Clock, MapPin } from 'lucide-react';

function Header({ handleLogout, setIsLoggedIn, isLoggedIn }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [avatar, setAvatar] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);
    const isUserLoggedIn = !!localStorage.getItem('token');

    const handleChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('https://backmovies-8saw.onrender.com/search', { query: searchTerm });
            const searchData = response.data;
            window.location.href = `/search-results/${encodeURIComponent(JSON.stringify(searchData))}`;
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
        }
    };

    async function fetchAvatar() {
        try {
            const userId = localStorage.getItem('userId');
            const avatarResponse = await axios.get(`https://backmovies-8saw.onrender.com/avatar/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });
            setAvatar(avatarResponse.data.avatar);
        } catch (error) {
            console.error('Error fetching avatar:', error);
        }
    }
    
    useEffect(() => {
        if (isUserLoggedIn) {
            fetchAvatar();
        }
    }, [isUserLoggedIn]);

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <header className="bg-gray-900/95 backdrop-blur-sm py-4 fixed w-full top-0 z-[9999] shadow-lg">
            <nav className="container mx-auto px-4">
                {/* Main Navigation Bar */}
                <div className="flex items-center justify-between">
                    {/* Left Section - Auth Buttons */}
                    <div className="flex items-center space-x-2">
                        {isUserLoggedIn ? (
                            <button 
                                onClick={handleLogout} 
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
                            >
                                <LogOut size={16} className="hidden sm:block" />
                                <span className="hidden sm:block">Déconnexion</span>
                                <LogOut size={16} className="sm:hidden" />
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <Link 
                                    to="/login" 
                                    className="px-3 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
                                >
                                    <span className="hidden sm:block">Se connecter</span>
                                    <span className="sm:hidden">Login</span>
                                </Link>
                                <Link 
                                    to="/inscription" 
                                    className="px-3 py-1.5 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
                                >
                                    <span className="hidden sm:block">S'inscrire</span>
                                    <span className="sm:hidden">Sign Up</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Center Section - Search & Navigation */}
                    <div className="flex items-center justify-center flex-1 mx-4">
                        <div className="hidden md:flex items-center space-x-4">
                            <Link 
                                to="/" 
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
                            >
                                <Home size={16} />
                                <span>Accueil</span>
                            </Link>
                            <Link 
                                to="/map" 
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
                            >
                                <MapPin size={16} />
                                <span>Festivals</span>
                            </Link>
                        </div>
                    </div>

                    {/* Right Section - Search, Avatar & Menu */}
                    <div className="flex items-center space-x-4">
                        {/* Desktop Search */}
                        <form onSubmit={handleSubmit} className="hidden md:block relative">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Rechercher un film..."
                                    value={searchTerm}
                                    onChange={handleChange}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                    className={`w-48 lg:w-64 px-3 py-1.5 pr-8 text-sm bg-gray-800 text-white rounded-lg border-2 transition-all duration-300 ${
                                        isSearchFocused 
                                            ? 'border-blue-500 ring-2 ring-blue-500/20' 
                                            : 'border-gray-700 hover:border-gray-600'
                                    }`}
                                />
                                <button 
                                    type="submit" 
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
                                >
                                    <Search size={16} />
                                </button>
                            </div>
                        </form>

                        {/* Mobile Search Toggle */}
                        <button 
                            onClick={() => setIsMobileSearchVisible(!isMobileSearchVisible)}
                            className="md:hidden text-white hover:text-gray-300 transition-colors duration-300"
                        >
                            <Search size={20} />
                        </button>

                        {/* Avatar */}
                        {isUserLoggedIn && avatar && (
                            <div className="relative">
                                <img 
                                    src={`data:image/jpeg;base64,${avatar}`} 
                                    alt="Avatar" 
                                    className="h-8 w-8 rounded-full ring-2 ring-white/20 transition-transform duration-300 hover:scale-110 cursor-pointer" 
                                />
                            </div>
                        )}

                        {/* Menu Button */}
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)} 
                            className="p-1.5 text-white hover:bg-gray-800 rounded-lg transition-colors duration-300"
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {isMobileSearchVisible && (
                    <form onSubmit={handleSubmit} className="mt-4 md:hidden">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Rechercher un film..."
                                value={searchTerm}
                                onChange={handleChange}
                                className="w-full px-3 py-1.5 pr-8 text-sm bg-gray-800 text-white rounded-lg border-2 border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                            <button 
                                type="submit" 
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
                            >
                                <Search size={16} />
                            </button>
                        </div>
                    </form>
                )}

                {/* Dropdown Menu */}
                <div 
                    className={`absolute right-4 mt-2 w-56 bg-gray-800 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 transition-all duration-300 transform origin-top-right
                        ${isMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
                >
                    <div className="py-2 p-1">
                        <Link 
                            to="/" 
                            onClick={closeMenu}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 rounded-lg hover:bg-gray-700 transition-colors duration-300"
                        >
                            <Home size={16} />
                            Accueil
                        </Link>
                        <Link 
                            to="/favoris" 
                            onClick={closeMenu}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 rounded-lg hover:bg-gray-700 transition-colors duration-300"
                        >
                            <Heart size={16} />
                            Films favoris
                        </Link>
                        <Link 
                            to="/vus" 
                            onClick={closeMenu}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 rounded-lg hover:bg-gray-700 transition-colors duration-300"
                        >
                            <Eye size={16} />
                            Films vus
                        </Link>
                        <Link 
                            to="/voir" 
                            onClick={closeMenu}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 rounded-lg hover:bg-gray-700 transition-colors duration-300"
                        >
                            <Clock size={16} />
                            Films à voir
                        </Link>
                        <Link 
                            to="/map" 
                            onClick={closeMenu}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 rounded-lg hover:bg-gray-700 transition-colors duration-300"
                        >
                            <MapPin size={16} />
                            Festivals à proximité
                        </Link>
                        
                        {isUserLoggedIn && (
                            <button 
                                onClick={() => {
                                    handleLogout();
                                    closeMenu();
                                }} 
                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 rounded-lg hover:bg-gray-700 transition-colors duration-300 w-full text-left"
                            >
                                <LogOut size={16} />
                                Déconnexion
                            </button>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;