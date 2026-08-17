import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AssignmentIcon from '@mui/icons-material/Assignment';

interface Livro {
  id: number;
  titulo: string;
  autorNome: string;
  status: string;
  capaUrl: string;
}

interface Emprestimo {
  id: number;
  nomePessoa: string;
  livroTitulo: string;
  dataEmprestimo: string;
  dataDevolucao: string | null;
}

const Dashboard = () => {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);

  useEffect(() => {
    api.get('/livros?page=0&size=100').then((res) => setLivros(res.data.content));
    api.get('/emprestimos').then((res) => setEmprestimos(res.data));
  }, []);

  const total = livros.length;
  const disponiveis = livros.filter((l) => l.status === 'DISPONIVEL').length;
  const emprestados = livros.filter((l) => l.status === 'EMPRESTADO').length;
  const emprestimosAtivos = emprestimos.filter((e) => !e.dataDevolucao).length;

const cards = [
  { label: 'Total de Livros', value: total, icon: <AutoStoriesIcon className="text-amber-600" /> },
  { label: 'Disponíveis', value: disponiveis, icon: <CheckCircleIcon className="text-green-500" /> },
  { label: 'Emprestados', value: emprestados, icon: <SwapHorizIcon className="text-orange-400" /> },
  { label: 'Empréstimos Ativos', value: emprestimosAtivos, icon: <AssignmentIcon className="text-blue-400" /> },
];
  const emprestimosRecentes = emprestimos.slice(0, 5);
  const livrosRecentes = [...livros].reverse().slice(0, 4);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-stone-800">Dashboard</h2>
          <p className="text-stone-500 text-sm mt-1">Visão geral do seu acervo</p>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {cards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="mb-3">{card.icon}</div>
              <p className="text-2xl font-bold text-stone-800">{card.value}</p>
              <p className="text-stone-500 text-sm mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Empréstimos recentes */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-stone-800">Empréstimos Recentes</h3>
            </div>
            {emprestimosRecentes.length === 0 ? (
              <p className="text-stone-400 text-sm">Nenhum empréstimo registrado.</p>
            ) : (
              <ul className="space-y-3">
                {emprestimosRecentes.map((e) => (
                  <li key={e.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-stone-800">{e.livroTitulo}</p>
                      <p className="text-xs text-stone-500">{e.nomePessoa}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      e.dataDevolucao
                        ? 'bg-stone-100 text-stone-500'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {e.dataDevolucao ? 'Devolvido' : 'Ativo'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Livros recentes */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-stone-800">Adicionados Recentemente</h3>
            </div>
            {livrosRecentes.length === 0 ? (
              <p className="text-stone-400 text-sm">Nenhum livro cadastrado.</p>
            ) : (
              <ul className="space-y-3">
                {livrosRecentes.map((l) => (
                  <li key={l.id} className="flex items-center gap-3">
                    {l.capaUrl ? (
                      <img src={l.capaUrl} alt={l.titulo} className="w-10 h-14 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-14 bg-stone-100 rounded flex items-center justify-center">
                        <AutoStoriesIcon className="text-stone-400" fontSize="small" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-stone-800">{l.titulo}</p>
                      <p className="text-xs text-stone-500">{l.autorNome}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;