import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ModalAdicionarLivro from '../components/ModalAdicionarLivro';
import api from '../api/axios';

import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

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

  const [modalAberto, setModalAberto] = useState(false);

  const [livroSelecionado, setLivroSelecionado] =
    useState<Livro | null>(null);

  const [livroEmEdicao, setLivroEmEdicao] =
    useState<Livro | null>(null);

  const [confirmacaoExclusao, setConfirmacaoExclusao] =
    useState(false);

  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState('');

  const carregarLivros = () => {
    api
      .get('/livros?page=0&size=100')
      .then((res) => {
        setLivros(res.data.content);
      })
      .catch((error) => {
        console.error('Erro ao carregar livros:', error);
      });
  };

  useEffect(() => {
    carregarLivros();
  }, []);

  const livrosFiltrados = livros.filter((livro) => {
    const termo = filtro.toLowerCase().trim();

    const matchTexto =
      livro.titulo.toLowerCase().includes(termo) ||
      livro.autorNome.toLowerCase().includes(termo) ||
      livro.categoriaNome.toLowerCase().includes(termo) ||
      livro.palavrasChave.some((palavra) =>
        palavra.toLowerCase().includes(termo)
      );

    const matchStatus =
      statusFiltro === 'TODOS' ||
      livro.status === statusFiltro;

    return matchTexto && matchStatus;
  });

  const abrirConfirmacaoExclusao = () => {
    setErroExclusao('');
    setConfirmacaoExclusao(true);
  };

  const cancelarExclusao = () => {
    if (excluindo) return;

    setConfirmacaoExclusao(false);
    setErroExclusao('');
  };

  const abrirEdicao = () => {
    if (!livroSelecionado) return;

    setLivroEmEdicao(livroSelecionado);
    setLivroSelecionado(null);
  };

  const fecharEdicao = () => {
    setLivroEmEdicao(null);
  };

  const excluirLivro = async () => {
    if (!livroSelecionado) return;

    try {
      setExcluindo(true);
      setErroExclusao('');

      await api.delete(`/livros/${livroSelecionado.id}`);

      setLivros((livrosAtuais) =>
        livrosAtuais.filter(
          (livro) => livro.id !== livroSelecionado.id
        )
      );

      setConfirmacaoExclusao(false);
      setLivroSelecionado(null);
    } catch (error) {
      console.error('Erro ao excluir livro:', error);

      setErroExclusao(
        'Não foi possível excluir o livro. Tente novamente.'
      );
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-800">
              Meus Livros
            </h2>

            <p className="text-stone-500 text-sm mt-1">
              {livros.length} livro
              {livros.length !== 1 ? 's' : ''} no acervo
            </p>
          </div>

          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <AddIcon fontSize="small" />
            Adicionar Livro
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">

          <div className="relative flex-1">
            <SearchIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              fontSize="small"
            />

            <input
              placeholder="Buscar por título, autor, categoria ou palavra-chave..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            />
          </div>

          <div className="flex gap-2">
            {[
              'TODOS',
              'DISPONIVEL',
              'EMPRESTADO',
            ].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFiltro(status)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFiltro === status
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-400'
                }`}
              >
                {status === 'TODOS'
                  ? 'Todos'
                  : status === 'DISPONIVEL'
                    ? 'Disponível'
                    : 'Emprestado'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de livros */}
        {livrosFiltrados.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <AutoStoriesIcon
              style={{ fontSize: 48 }}
              className="mb-3"
            />

            <p className="text-lg font-medium">
              Nenhum livro encontrado
            </p>

            <p className="text-sm mt-1">
              Adicione livros ao seu acervo
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">

            {livrosFiltrados.map((livro) => (
              <div
                key={livro.id}
                onClick={() =>
                  setLivroSelecionado(livro)
                }
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
              >

                {/* Capa */}
                {livro.capaUrl ? (
                  <img
                    src={livro.capaUrl}
                    alt={livro.titulo}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-stone-100 flex items-center justify-center">
                    <AutoStoriesIcon
                      className="text-stone-300"
                      style={{ fontSize: 48 }}
                    />
                  </div>
                )}

                {/* Informações */}
                <div className="p-3 h-28 flex flex-col">

                  <p className="text-sm font-semibold text-stone-800 line-clamp-2">
                    {livro.titulo}
                  </p>

                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                    {livro.autorNome}
                  </p>

                  <div className="mt-auto">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        livro.status === 'DISPONIVEL'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {livro.status === 'DISPONIVEL'
                        ? 'Disponível'
                        : 'Emprestado'}
                    </span>
                  </div>

                </div>
              </div>
            ))}

          </div>
        )}

        {/* Modal de adicionar */}
        {modalAberto && (
          <ModalAdicionarLivro
            onClose={() => setModalAberto(false)}
            onSalvo={() => {
              carregarLivros();
              setModalAberto(false);
            }}
          />
        )}

        {/* Modal de detalhes */}
        {livroSelecionado && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
            onClick={() =>
              setLivroSelecionado(null)
            }
          >
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* Cabeçalho */}
              <div className="flex items-center justify-between p-6 border-b border-stone-100">

                <h2 className="text-lg font-bold text-stone-800">
                  Detalhes do Livro
                </h2>

                <button
                  onClick={() =>
                    setLivroSelecionado(null)
                  }
                  className="text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <CloseIcon />
                </button>

              </div>

              {/* Conteúdo */}
              <div className="p-6">

                <div className="flex flex-col sm:flex-row gap-6">

                  {/* Capa */}
                  <div className="flex-shrink-0 flex justify-center">
                    {livroSelecionado.capaUrl ? (
                      <img
                        src={livroSelecionado.capaUrl}
                        alt={livroSelecionado.titulo}
                        className="w-40 h-56 object-cover rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="w-40 h-56 bg-stone-100 rounded-lg flex items-center justify-center">
                        <AutoStoriesIcon
                          className="text-stone-300"
                          style={{ fontSize: 64 }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="flex-1">

                    <h3 className="text-2xl font-bold text-stone-800">
                      {livroSelecionado.titulo}
                    </h3>

                    <p className="text-stone-500 mt-1">
                      {livroSelecionado.autorNome}
                    </p>

                    {/* ID */}
                    <p className="text-xs text-stone-400 mt-1">
                      ID: {livroSelecionado.id}
                    </p>

                    <div className="mt-4 space-y-2 text-sm">

                      {livroSelecionado.editora && (
                        <div>
                          <span className="font-medium text-stone-700">
                            Editora:
                          </span>{' '}

                          <span className="text-stone-500">
                            {livroSelecionado.editora}
                          </span>
                        </div>
                      )}

                      {livroSelecionado.categoriaNome && (
                        <div>
                          <span className="font-medium text-stone-700">
                            Categoria:
                          </span>{' '}

                          <span className="text-stone-500">
                            {livroSelecionado.categoriaNome}
                          </span>
                        </div>
                      )}

                      <div>
                        <span className="font-medium text-stone-700">
                          Status:
                        </span>{' '}

                        <span
                          className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                            livroSelecionado.status ===
                            'DISPONIVEL'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {livroSelecionado.status ===
                          'DISPONIVEL'
                            ? 'Disponível'
                            : 'Emprestado'}
                        </span>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Descrição */}
                {livroSelecionado.descricao && (
                  <div className="mt-6">

                    <h4 className="text-sm font-semibold text-stone-800 mb-2">
                      Sinopse
                    </h4>

                    <p className="text-sm text-stone-600 leading-relaxed">
                      {livroSelecionado.descricao}
                    </p>

                  </div>
                )}

                {/* Palavras-chave */}
                {livroSelecionado.palavrasChave &&
                  livroSelecionado.palavrasChave.length >
                    0 && (
                    <div className="mt-6">

                      <h4 className="text-sm font-semibold text-stone-800 mb-2">
                        Palavras-chave
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        {livroSelecionado.palavrasChave.map(
                          (palavra, index) => (
                            <span
                              key={`${palavra}-${index}`}
                              className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full"
                            >
                              {palavra}
                            </span>
                          )
                        )}
                      </div>

                    </div>
                  )}

                {/* Ações */}
                <div className="mt-8 pt-5 border-t border-stone-100 flex justify-between items-center">

                  <button
                    onClick={abrirConfirmacaoExclusao}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <DeleteIcon fontSize="small" />
                    Excluir livro
                  </button>

                  <button
                    onClick={abrirEdicao}
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <EditIcon fontSize="small" />
                    Editar livro
                  </button>

                </div>

              </div>
            </div>
          </div>
        )}

        {/* Modal de edição */}
        {livroEmEdicao && (
          <ModalAdicionarLivro
            livro={livroEmEdicao}
            onClose={fecharEdicao}
            onSalvo={() => {
              carregarLivros();
              setLivroEmEdicao(null);
            }}
          />
        )}

        {/* Modal de confirmação de exclusão */}
        {confirmacaoExclusao && livroSelecionado && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] px-4"
            onClick={cancelarExclusao}
          >
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="flex items-start gap-4">

                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <DeleteIcon className="text-red-600" />
                </div>

                <div>

                  <h3 className="text-lg font-bold text-stone-800">
                    Excluir livro
                  </h3>

                  <p className="text-sm text-stone-600 mt-2">
                    Deseja realmente excluir o livro da sua biblioteca?
                  </p>

                  <p className="text-sm font-medium text-stone-800 mt-2">
                    {livroSelecionado.titulo}
                  </p>

                </div>

              </div>

              {/* Erro */}
              {erroExclusao && (
                <p className="text-sm text-red-600 mt-4">
                  {erroExclusao}
                </p>
              )}

              {/* Botões */}
              <div className="flex justify-end gap-3 mt-6">

                <button
                  onClick={cancelarExclusao}
                  disabled={excluindo}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  onClick={excluirLivro}
                  disabled={excluindo}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {excluindo
                    ? 'Excluindo...'
                    : 'Excluir'}
                </button>

              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Livros;