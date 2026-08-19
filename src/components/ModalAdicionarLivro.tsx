import { useEffect, useRef, useState } from 'react';
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

interface Props {
  onClose: () => void;
  onSalvo: () => void;
  livro?: Livro | null;
}

const ModalAdicionarLivro = ({
  onClose,
  onSalvo,
  livro,
}: Props) => {
  const modoEdicao = !!livro;

  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<OpenLibraryBook[]>([]);
  const [buscando, setBuscando] = useState(false);

  const [etapa, setEtapa] = useState<
    'busca' | 'formulario'
  >(modoEdicao ? 'formulario' : 'busca');

  const [titulo, setTitulo] = useState(livro?.titulo || '');
  const [autorNome, setAutorNome] = useState(
    livro?.autorNome || ''
  );
  const [editora, setEditora] = useState(
    livro?.editora || ''
  );
  const [descricao, setDescricao] = useState(
    livro?.descricao || ''
  );
  const [capaUrl, setCapaUrl] = useState(
    livro?.capaUrl || ''
  );
  const [categoriaNome, setCategoriaNome] = useState(
    livro?.categoriaNome || ''
  );
  const [palavrasChave, setPalavrasChave] = useState(
    livro?.palavrasChave?.join(', ') || ''
  );

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const abortControllerRef =
    useRef<AbortController | null>(null);

  const buscarOpenLibrary = async (termoBusca?: string) => {
    const termo = (termoBusca ?? busca).trim();

    if (termo.length < 3) {
      setResultados([]);
      setBuscando(false);

      if (termo.length > 0) {
        setErro(
          'Digite pelo menos 3 caracteres para buscar.'
        );
      } else {
        setErro('');
      }

      return;
    }

    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setBuscando(true);
    setErro('');

    try {
      const url =
        `https://openlibrary.org/search.json` +
        `?q=${encodeURIComponent(termo)}` +
        `&limit=10` +
        `&fields=key,title,author_name,publisher,first_publish_year,cover_i,isbn`;

      const res = await fetch(url, {
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(
          `Open Library retornou ${res.status}`
        );
      }

      const data = await res.json();

      if (!controller.signal.aborted) {
        if (data.docs && data.docs.length > 0) {
          setResultados(data.docs);
          setErro('');
        } else {
          setResultados([]);
          setErro('Nenhum livro encontrado.');
        }
      }
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {
        return;
      }

      console.error(
        'Erro ao buscar na Open Library:',
        error
      );

      if (!controller.signal.aborted) {
        setResultados([]);
        setErro(
          'Não foi possível buscar os livros. Tente novamente.'
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setBuscando(false);
      }
    }
  };

  useEffect(() => {
    if (modoEdicao) return;

    const termo = busca.trim();

    if (termo.length === 0) {
      setResultados([]);
      setErro('');
      setBuscando(false);
      return;
    }

    if (termo.length < 3) {
      setResultados([]);
      setErro(
        'Digite pelo menos 3 caracteres para buscar.'
      );
      setBuscando(false);
      return;
    }

    const timeout = setTimeout(() => {
      buscarOpenLibrary(termo);
    }, 400);

    return () => {
      clearTimeout(timeout);
    };
  }, [busca, modoEdicao]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const obterCapa = (
    livro: OpenLibraryBook,
    tamanho: 'S' | 'M'
  ) => {
    if (livro.cover_i) {
      return `https://covers.openlibrary.org/b/id/${livro.cover_i}-${tamanho}.jpg`;
    }

    if (livro.isbn?.[0]) {
      return `https://covers.openlibrary.org/b/isbn/${livro.isbn[0]}-${tamanho}.jpg`;
    }

    return '';
  };

  const selecionarLivro = (
    livro: OpenLibraryBook
  ) => {
    setTitulo(livro.title || '');
    setAutorNome(livro.author_name?.[0] || '');
    setEditora(livro.publisher?.[0] || '');
    setCapaUrl(obterCapa(livro, 'M'));
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
          a.nome.toLowerCase() ===
          autorNome.toLowerCase()
      );

      if (!autor) {
        const novoAutor = await api.post('/autores', {
          nome: autorNome,
        });

        autor = novoAutor.data;
      }

      // Busca ou cria categoria
      const categoriasRes =
        await api.get('/categorias');

      let categoria = categoriasRes.data.find(
        (c: Categoria) =>
          c.nome.toLowerCase() ===
          categoriaNome.toLowerCase()
      );

      if (!categoria) {
        const novaCategoria = await api.post(
          '/categorias',
          {
            nome: categoriaNome,
          }
        );

        categoria = novaCategoria.data;
      }

      const dadosLivro = {
        titulo,
        editora,
        descricao,
        capaUrl,
        status: modoEdicao
          ? livro!.status
          : 'DISPONIVEL',
        autorId: autor.id,
        categoriaId: categoria.id,
        palavrasChave: palavrasChave
          .split(',')
          .map((p) => p.trim())
          .filter((p) => p.length > 0),
      };

      if (modoEdicao) {
        await api.put(
          `/livros/${livro!.id}`,
          dadosLivro
        );
      } else {
        await api.post('/livros', dadosLivro);
      }

      onSalvo();
      onClose();
    } catch (error) {
      console.error(
        modoEdicao
          ? 'Erro ao atualizar livro:'
          : 'Erro ao salvar livro:',
        error
      );

      setErro(
        modoEdicao
          ? 'Erro ao atualizar o livro. Verifique os campos.'
          : 'Erro ao salvar o livro. Verifique os campos.'
      );
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
            {modoEdicao
              ? 'Editar Livro'
              : etapa === 'busca'
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

          {/* Busca */}
          {etapa === 'busca' && !modoEdicao && (
            <>
              <div className="relative mb-4">
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
                      e.preventDefault();
                      buscarOpenLibrary();
                    }
                  }}
                  className="w-full pl-9 pr-12 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  autoFocus
                />

                {buscando && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {erro && (
                <p
                  className={`text-sm mb-4 ${
                    erro === 'Nenhum livro encontrado.'
                      ? 'text-stone-500'
                      : 'text-red-500'
                  }`}
                >
                  {erro}
                </p>
              )}

              {resultados.length > 0 && (
                <ul className="space-y-3 mb-4">
                  {resultados.map((livro) => {
                    const capa = obterCapa(livro, 'S');

                    return (
                      <li
                        key={livro.key}
                        onClick={() =>
                          selecionarLivro(livro)
                        }
                        className="flex gap-3 p-3 rounded-xl border border-stone-100 hover:border-amber-300 hover:bg-amber-50 cursor-pointer transition-colors"
                      >
                        <div className="w-12 h-16 flex-shrink-0 bg-stone-100 rounded overflow-hidden flex items-center justify-center">
                          {capa ? (
                            <img
                              src={capa}
                              alt={livro.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  'none';
                              }}
                            />
                          ) : (
                            <AutoStoriesIcon
                              className="text-stone-300"
                              fontSize="small"
                            />
                          )}
                        </div>

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
                    );
                  })}
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

          {/* Formulário */}
          {etapa === 'formulario' && (
            <>
              {capaUrl && (
                <div className="flex justify-center mb-4">
                  <img
                    src={capaUrl}
                    alt={titulo}
                    className="h-32 object-cover rounded-lg shadow"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        'none';
                    }}
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
                    onChange={(e) =>
                      setTitulo(e.target.value)
                    }
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Autor *
                  </label>

                  <input
                    value={autorNome}
                    onChange={(e) =>
                      setAutorNome(e.target.value)
                    }
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Editora
                  </label>

                  <input
                    value={editora}
                    onChange={(e) =>
                      setEditora(e.target.value)
                    }
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
                    onChange={(e) =>
                      setCategoriaNome(e.target.value)
                    }
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
                    onChange={(e) =>
                      setPalavrasChave(e.target.value)
                    }
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
                    onChange={(e) =>
                      setDescricao(e.target.value)
                    }
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
                {!modoEdicao && (
                  <button
                    onClick={() => setEtapa('busca')}
                    className="flex-1 border border-stone-200 text-stone-600 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors"
                  >
                    Voltar
                  </button>
                )}

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
                  {salvando
                    ? modoEdicao
                      ? 'Salvando...'
                      : 'Salvando...'
                    : modoEdicao
                      ? 'Salvar alterações'
                      : 'Salvar Livro'}
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