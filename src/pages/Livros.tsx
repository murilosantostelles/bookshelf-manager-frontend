import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

interface Livro {
  id: number;
  titulo: string;
  autorNome: string;
  editora: string;
  descricao: string;
  capaUrl: string;
  status: string;
  categoriaNome: string;
  palavrasChave: string[];
}

const Livros = () => {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('TODOS');

  const carregarLivros = () => {
    api.get('/livros?page=0&size=100').then((res) => setLivros(res.data.content));
  };

  useEffect(() => {
    carregarLivros();
  }, []);

  const livrosFiltrados = livros.filter((l) => {
    const matchTexto =
      l.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
      l.autorNome.toLowerCase().includes(filtro.toLowerCase()) ||
      l.categoriaNome.toLowerCase().includes(filtro.toLowerCase());

    const matchStatus =
      statusFiltro === 'TODOS' || l.status === statusFiltro;

    return matchTexto && matchStatus;
  });

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-800">Meus Livros</h2>
            <p className="text-stone-500 text-sm mt-1">{livros.length} livro{livros.length !== 1 ? 's' : ''} no acervo</p>
          </div>
          <button
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <AddIcon fontSize="small" />
            Adicionar Livro
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" fontSize="small" />
            <input
              placeholder="Buscar por título, autor ou categoria..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            />
          </div>
          <div className="flex gap-2">
            {['TODOS', 'DISPONIVEL', 'EMPRESTADO'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFiltro(s)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFiltro === s
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-400'
                }`}
              >
                {s === 'TODOS' ? 'Todos' : s === 'DISPONIVEL' ? 'Disponível' : 'Emprestado'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de livros */}
        {livrosFiltrados.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <AutoStoriesIcon style={{ fontSize: 48 }} className="mb-3" />
            <p className="text-lg font-medium">Nenhum livro encontrado</p>
            <p className="text-sm mt-1">Adicione livros ao seu acervo</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {livrosFiltrados.map((livro) => (
              <div key={livro.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                {livro.capaUrl ? (
                  <img
                    src={livro.capaUrl}
                    alt={livro.titulo}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-stone-100 flex items-center justify-center">
                    <AutoStoriesIcon className="text-stone-300" style={{ fontSize: 48 }} />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm font-semibold text-stone-800 line-clamp-2">{livro.titulo}</p>
                  <p className="text-xs text-stone-500 mt-1">{livro.autorNome}</p>
                  <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                    livro.status === 'DISPONIVEL'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {livro.status === 'DISPONIVEL' ? 'Disponível' : 'Emprestado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Livros;