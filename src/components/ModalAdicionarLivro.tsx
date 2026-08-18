import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import api from '../api/axios';

interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  publisher?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
}

interface Autor {
  id: number;
  nome: string;
}

interface Categoria {
  id: number;
  nome: string;
  subcategoria?: string;
}

interface Props {
  onClose: () => void;
  onSalvo: () => void;
}

const ModalAdicionarLivro = ({ onClose, onSalvo }: Props) => {
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<OpenLibraryBook[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [etapa, setEtapa] = useState<'busca' | 'formulario'>('busca');

  const [titulo, setTitulo] = useState('');
  const [autorNome, setAutorNome] = useState('');
  const [editora, setEditora] = useState('');
  const [descricao, setDescricao] = useState('');
  const [capaUrl, setCapaUrl] = useState('');
  const [categoriaNome, setCategoriaNome] = useState('');
  const [palavrasChave, setPalavrasChave] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const buscarOpenLibrary = async () => {
    if (!busca.trim()) {
      setErro('Digite o nome de um livro para buscar.');
      return;
    }

    setBuscando(true);
    setErro('');
    setResultados([]);

    try {
      const url =
        `https://openlibrary.org/search.json` +
        `?q=${encodeURIComponent(busca.trim())}` +
        `&limit=10` +
        `&fields=key,title,author_name,publisher,first_publish_year,cover_i,isbn`;

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Open Library retornou ${res.status}`);
      }

      const data = await res.json();

      if (data.docs && data.docs.length > 0) {
        setResultados(data.docs);
      } else {
        setErro('Nenhum livro encontrado.');
      }
    } catch (error) {
      console.error('Erro ao buscar na Open Library:', error);
      setErro('Não foi possível buscar os livros. Tente novamente.');
    } finally {
      setBuscando(false);
    }
  };

  const selecionarLivro = (livro: OpenLibraryBook) => {
    setTitulo(livro.title || '');
    setAutorNome(livro.author_name?.[0] || '');
    setEditora(livro.publisher?.[0] || '');

    if (livro.cover_i) {
      setCapaUrl(
        `https://covers.openlibrary.org/b/id/${livro.cover_i}-M.jpg`
      );
    } else if (livro.isbn?.[0]) {
      setCapaUrl(
        `https://covers.openlibrary.org/b/isbn/${livro.isbn[0]}-M.jpg`
      );
    } else {
      setCapaUrl('');
    }

    setDescricao('');
    setErro('');
    setEtapa('formulario');
  };

  const preencherManualmente = () => {
    setErro('');
    setEtapa('formulario');
  };

  const salvar = async () => {
    setSalvando(true);
    setErro('');

    try {
      // Busca ou cria autor
      const autoresRes = await api.get('/autores');

      let autor = autoresRes.data.find(
        (a: Autor) =>
          a.nome.toLowerCase() === autorNome.toLowerCase()
      );

      if (!autor) {
        const novoAutor = await api.post('/autores', {
          nome: autorNome,
        });

        autor = novoAutor.data;
      }

      // Busca ou cria categoria
      const categoriasRes = await api.get('/categorias');

      let categoria = categoriasRes.data.find(
        (c: Categoria) =>
          c.nome.toLowerCase() === categoriaNome.toLowerCase()
      );

      if (!categoria) {
        const novaCategoria = await api.post('/categorias', {
          nome: categoriaNome,
        });

        categoria = novaCategoria.data;
      }

      // Salva o livro
      await api.post('/livros', {
        titulo,
        editora,
        descricao,
        capaUrl,
        status: 'DISPONIVEL',
        autorId: autor.id,
        categoriaId: categoria.id,
        palavrasChave: palavrasChave
          .split(',')
          .map((p) => p.trim())
          .filter((p) => p.length > 0),
      });

      onSalvo();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar livro:', error);
      setErro('Erro ao salvar o livro. Verifique os campos.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="text-lg font-bold text-stone-800">
            {etapa === 'busca'
              ? 'Adicionar Livro'
              : 'Detalhes do Livro'}
          </h2>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6">

          {/* Etapa de busca */}
          {etapa === 'busca' && (
            <>
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <SearchIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                    fontSize="small"
                  />

                  <input
                    placeholder="Buscar livro..."
                    value={busca}
                    onChange={(e) => {
                      setBusca(e.target.value);
                      setErro('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        buscarOpenLibrary();
                      }
                    }}
                    className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <button
                  onClick={buscarOpenLibrary}
                  disabled={buscando}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {buscando ? 'Buscando...' : 'Buscar'}
                </button>
              </div>

              {erro && (
                <p className="text-red-500 text-sm mb-4">
                  {erro}
                </p>
              )}

              {resultados.length > 0 && (
                <ul className="space-y-3 mb-4">
                  {resultados.map((livro) => (
                    <li
                      key={livro.key}
                      onClick={() => selecionarLivro(livro)}
                      className="flex gap-3 p-3 rounded-xl border border-stone-100 hover:border-amber-300 hover:bg-amber-50 cursor-pointer transition-colors"
                    >
                      {livro.cover_i ? (
                        <img
                          src={`https://covers.openlibrary.org/b/id/${livro.cover_i}-M.jpg`}
                          alt={livro.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-stone-100 rounded flex items-center justify-center">
                          <AutoStoriesIcon
                            className="text-stone-300"
                            fontSize="small"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-800 line-clamp-2">
                          {livro.title}
                        </p>

                        <p className="text-xs text-stone-500 mt-0.5">
                          {livro.author_name?.join(', ') ||
                            'Autor desconhecido'}
                        </p>

                        {livro.publisher?.[0] && (
                          <p className="text-xs text-stone-400 mt-0.5">
                            {livro.publisher[0]}
                          </p>
                        )}

                        {livro.first_publish_year && (
                          <p className="text-xs text-stone-400 mt-0.5">
                            {livro.first_publish_year}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={preencherManualmente}
                className="w-full text-sm text-stone-500 hover:text-amber-600 py-2 transition-colors"
              >
                Livro não encontrado? Preencher manualmente
              </button>
            </>
          )}

          {/* Etapa de formulário */}
          {etapa === 'formulario' && (
            <>
              {capaUrl && (
                <div className="flex justify-center mb-4">
                  <img
                    src={capaUrl}
                    alt={titulo}
                    className="h-32 object-cover rounded-lg shadow"
                  />
                </div>
              )}

              <div className="space-y-3">

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Título *
                  </label>

                  <input
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Autor *
                  </label>

                  <input
                    value={autorNome}
                    onChange={(e) => setAutorNome(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Editora
                  </label>

                  <input
                    value={editora}
                    onChange={(e) => setEditora(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Categoria *
                  </label>

                  <input
                    placeholder="Ex: Psicologia, Romance, Autoajuda..."
                    value={categoriaNome}
                    onChange={(e) => setCategoriaNome(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Palavras-chave
                  </label>

                  <input
                    placeholder="Ex: ansiedade, terapia, autoconhecimento"
                    value={palavrasChave}
                    onChange={(e) => setPalavrasChave(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />

                  <p className="text-xs text-stone-400 mt-1">
                    Separe por vírgula
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Sinopse
                  </label>

                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={3}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  />
                </div>

              </div>

              {erro && (
                <p className="text-red-500 text-sm mt-3">
                  {erro}
                </p>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setEtapa('busca')}
                  className="flex-1 border border-stone-200 text-stone-600 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors"
                >
                  Voltar
                </button>

                <button
                  onClick={salvar}
                  disabled={
                    salvando ||
                    !titulo ||
                    !autorNome ||
                    !categoriaNome
                  }
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {salvando ? 'Salvando...' : 'Salvar Livro'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default ModalAdicionarLivro;