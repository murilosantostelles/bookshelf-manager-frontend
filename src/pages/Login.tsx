import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import api from '../api/axios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch {
      setErro('Email ou senha inválidos.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">

        <div className="mb-8 text-center">
          <AutoStoriesIcon className="text-amber-600 mb-2" style={{ fontSize: 40 }} />
          <h1 className="text-2xl font-bold text-stone-800">Bookshelf</h1>
          <p className="text-stone-500 mt-1 text-sm">Faça login para acessar seu acervo</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {mostrarSenha ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </button>
            </div>
          </div>

          {erro && <p className="text-red-500 text-sm">{erro}</p>}

          <button
            onClick={handleLogin}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Entrar
          </button>
        </div>

        <p className="text-center text-sm text-stone-500 mt-6">
          Não tem conta?{' '}
          <Link to="/register" className="text-amber-600 hover:underline font-medium">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;