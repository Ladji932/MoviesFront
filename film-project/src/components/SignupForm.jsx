import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const SignupForm = ({ csrfToken }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!avatar) {
      setError('Veuillez sélectionner un avatar.');
      return;
    }
    if (!email.match(emailRegex)) {
      setError('Veuillez saisir une adresse e-mail valide.');
      return;
    }
    if (!password.match(/^(?=.*\d).{8,}$/)) {
      setError('Votre mot de passe doit contenir au moins 8 caractères, dont au moins un chiffre.');
      return;
    }

    try {
      const userData = new FormData();
      userData.append('username', username);
      userData.append('email', email);
      userData.append('password', password);
      userData.append('avatar', avatar);

      const response = await axios.post(
        'https://backmovies-8saw.onrender.com/inscription',
        userData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'CSRF-Token': csrfToken
          }
        }
      );

      console.log('Inscription réussie :', response.data);
      setSuccessMessage('Inscription réussie !');
      setUsername('');
      setEmail('');
      setPassword('');
      setAvatar(null);
      
      // Rediriger vers la page de connexion après un délai de 2 secondes
      setTimeout(() => {
        navigate('/connexion');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de l\'inscription :', error.response.data.message);
      setError(error.response.data.message);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    console.log('Avatar sélectionné :', file);
    setAvatar(file);
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className='bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {successMessage && <div className="text-green-500 mb-4">{successMessage}</div>}
        <input className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="Nom d'utilisateur" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="email" placeholder="Adresse e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
        <label htmlFor="avatar" className="block text-gray-700 text-sm font-bold mb-2 text-center">Choisissez votre avatar</label>
        <input id="avatar" className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="file" accept="image/*" name='avatar' onChange={handleAvatarChange} />
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mx-auto block mt-4" type="submit">S'inscrire</button>
      </form>
      <Link to="/connexion" className="text-gray-600">Se connecter</Link>
    </div>
  );
};

export default SignupForm;
