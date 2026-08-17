import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import api from '../api/axios';

const Register = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleRegister = async () => {
    try {
      await api.post('/auth/register', { nome, email, senha });
      navigate('/login');
    } catch {
      setErro('Erro ao cadastrar. Verifique os dados.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">

        <div className="mb-8 text-center">
          <AutoStoriesIcon className="text-amber-600 mb-2" style={{ fontSize: 40 }} />
          <h1 className="text-2xl font-bold text-stone-800">Bookshelf</h1>
          <p className="text-stone-500 mt-1 text-sm">Crie sua conta e gerencie seu acervo</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nome</label>
            <input
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

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
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {erro && <p className="text-red-500 text-sm">{erro}</p>}

          <button
            onClick={handleRegister}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Cadastrar
          </button>
        </div>

        <p className="text-center text-sm text-stone-500 mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-amber-600 hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;