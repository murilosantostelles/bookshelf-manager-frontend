import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 24 }}>
      <h2>Cadastro</h2>
      <input
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
      />
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
      />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
      />
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      <button onClick={handleRegister} style={{ width: '100%', padding: 10 }}>
        Cadastrar
      </button>
      <p>Já tem conta? <Link to="/login">Entrar</Link></p>
    </div>
  );
};

export default Register;