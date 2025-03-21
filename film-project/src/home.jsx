import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Home({ setIsLoggedIn, csrfToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validation des champs vides
    if (!username || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const response = await axios.post(
        'https://backmovies-8saw.onrender.com/login',
        { username, password },
        { headers: { 'CSRF-Token': csrfToken } }
      );

      if (response && response.data) {
        const { token, userId } = response.data; 
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId); 
        navigate("/")
        window.location.reload();
      } else {
        setError("Réponse de serveur incorrecte");
      }
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
      <form onSubmit={handleLogin} className='bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <input className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="Nom d'utilisateur" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="mb-6 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">Connexion</button>
      </form>
      <Link to="/inscription" className="text-gray-600">Vous n'avez pas de compte ? Inscrivez-vous ici</Link>
    </div>
  );
}

export default Home;
