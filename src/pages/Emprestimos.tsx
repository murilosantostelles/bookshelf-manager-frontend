import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

import AddIcon from '@mui/icons-material/Add';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

interface Emprestimo {
  id: number;
  nomePessoa: string;
  dataEmprestimo: string;
  dataDevolucao: string | null;
  livroTitulo: string;
}

interface Livro {
  id: number;
  titulo: string;
  status: string;
}

type StatusFiltro = 'TODOS' | 'ATIVOS' | 'ATRASADOS';

const Emprestimos = () => {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>('TODOS');
  const [modalAberto, setModalAberto] = useState(false);
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState<Emprestimo | null>(null);
  const [nomePessoa, setNomePessoa] = useState('');
  const [livroId, setLivroId] = useState('');
  const [dataDevolucao, setDataDevolucao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState('');

  const carregarEmprestimos = async () => {
    try {
      const response = await api.get('/emprestimos');
      setEmprestimos(response.data);
    } catch (error) {
      console.error('Erro ao carregar empréstimos:', error);
    }
  };

  const carregarLivros = async () => {
    try {
      const response = await api.get('/livros?page=0&size=100');
      setLivros(response.data.content.filter((l: Livro) => l.status === 'DISPONIVEL'));
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
    }
  };

  useEffect(() => {
    carregarEmprestimos();
    carregarLivros();
  }, []);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const obterStatus = (emprestimo: Emprestimo) => {
    if (!emprestimo.dataDevolucao) return 'ATIVO';
    const dataDev = new Date(`${emprestimo.dataDevolucao}T00:00:00`);
    if (dataDev < hoje) return 'ATRASADO';
    return 'ATIVO';
  };

  const emprestimosFiltrados = useMemo(() => {
    const termo = filtro.toLowerCase().trim();
    return emprestimos.filter((emprestimo) => {
      const matchTexto =
        emprestimo.nomePessoa.toLowerCase().includes(termo) ||
        emprestimo.livroTitulo.toLowerCase().includes(termo);
      const status = obterStatus(emprestimo);
      const matchStatus =
        statusFiltro === 'TODOS' ||
        (statusFiltro === 'ATIVOS' && status === 'ATIVO') ||
        (statusFiltro === 'ATRASADOS' && status === 'ATRASADO');
      return matchTexto && matchStatus;
    });
  }, [emprestimos, filtro, statusFiltro]);

  const abrirModal = () => {
    setNomePessoa('');
    setLivroId('');
    setDataDevolucao('');
    setErro('');
    setModalAberto(true);
  };

  const fecharModal = () => {
    if (salvando) return;
    setModalAberto(false);
    setErro('');
  };

  const cadastrarEmprestimo = async () => {
    if (!nomePessoa.trim() || !livroId || !dataDevolucao) {
      setErro('Preencha todos os campos.');
      return;
    }
    try {
      setSalvando(true);
      setErro('');
      const hojeFormatado = new Date().toISOString().split('T')[0];
      await api.post('/emprestimos', {
        nomePessoa: nomePessoa.trim(),
        dataEmprestimo: hojeFormatado,
        dataDevolucao,
        livroId: Number(livroId),
      });
      await carregarEmprestimos();
      await carregarLivros();
      setModalAberto(false);
    } catch (error) {
      console.error('Erro ao cadastrar empréstimo:', error);
      setErro('Não foi possível cadastrar o empréstimo. Verifique os dados.');
    } finally {
      setSalvando(false);
    }
  };

  const excluirEmprestimo = async () => {
    if (!confirmacaoExclusao) return;
    try {
      setExcluindo(true);
      await api.delete(`/emprestimos/${confirmacaoExclusao.id}`);
      await carregarEmprestimos();
      await carregarLivros();
      setConfirmacaoExclusao(null);
    } catch (error) {
      console.error('Erro ao excluir empréstimo:', error);
    } finally {
      setExcluindo(false);
    }
  };

  const formatarData = (data: string | null) => {
    if (!data) return '-';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-800">Empréstimos</h2>
            <p className="text-stone-500 text-sm mt-1">
              {emprestimos.length} empréstimo{emprestimos.length !== 1 ? 's' : ''} no histórico
            </p>
          </div>
          <button
            onClick={abrirModal}
            className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <AddIcon fontSize="small" />
            Novo Empréstimo
          </button>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" fontSize="small" />
            <input
              placeholder="Buscar por pessoa ou livro..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {[['TODOS', 'Todos'], ['ATIVOS', 'Ativos'], ['ATRASADOS', 'Atrasados']].map(([status, label]) => (
              <button
                key={status}
                onClick={() => setStatusFiltro(status as StatusFiltro)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFiltro === status
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {emprestimosFiltrados.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <AssignmentReturnIcon style={{ fontSize: 48 }} className="mb-3" />
            <p className="text-lg font-medium">Nenhum empréstimo encontrado</p>
            <p className="text-sm mt-1">Cadastre um novo empréstimo para começar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emprestimosFiltrados.map((emprestimo) => {
              const status = obterStatus(emprestimo);
              return (
                <div key={emprestimo.id} className="bg-white rounded-xl shadow-sm border border-stone-100 p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <AssignmentReturnIcon className="text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-800 truncate">{emprestimo.livroTitulo}</p>
                        <p className="text-sm text-stone-500 mt-0.5">Emprestado para {emprestimo.nomePessoa}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5 text-sm lg:min-w-[280px]">
                      <div>
                        <p className="text-xs text-stone-400 mb-1">Empréstimo</p>
                        <p className="font-medium text-stone-700">{formatarData(emprestimo.dataEmprestimo)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 mb-1">Devolução prevista</p>
                        <p className="font-medium text-stone-700">{formatarData(emprestimo.dataDevolucao)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        status === 'ATRASADO' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {status === 'ATRASADO' ? 'Atrasado' : 'Ativo'}
                      </span>

                      <button
                        onClick={() => setConfirmacaoExclusao(emprestimo)}
                        className="flex items-center gap-1.5 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <AssignmentReturnIcon fontSize="small" />
                        Registrar devolução
                      </button>

                      <button
                        onClick={() => setConfirmacaoExclusao(emprestimo)}
                        className="text-stone-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Excluir empréstimo"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {modalAberto && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={fecharModal}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-stone-100">
                <h2 className="text-lg font-bold text-stone-800">Novo Empréstimo</h2>
                <button onClick={fecharModal} className="text-stone-400 hover:text-stone-600">
                  <CloseIcon />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Pessoa *</label>
                  <input
                    value={nomePessoa}
                    onChange={(e) => setNomePessoa(e.target.value)}
                    placeholder="Nome de quem vai pegar o livro"
                    className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Livro *</label>
                  <select
                    value={livroId}
                    onChange={(e) => setLivroId(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  >
                    <option value="">Selecione um livro disponível</option>
                    {livros.map((livro) => (
                      <option key={livro.id} value={livro.id}>{livro.titulo}</option>
                    ))}
                  </select>
                  {livros.length === 0 && (
                    <p className="text-xs text-stone-400 mt-1">Nenhum livro disponível para empréstimo.</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Data de devolução *</label>
                  <input
                    type="date"
                    value={dataDevolucao}
                    onChange={(e) => setDataDevolucao(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div className="bg-stone-50 rounded-lg p-3">
                  <p className="text-xs text-stone-500">A data do empréstimo será registrada automaticamente como hoje.</p>
                </div>
                {erro && <p className="text-sm text-red-500">{erro}</p>}
                <div className="flex gap-3 pt-2">
                  <button onClick={fecharModal} disabled={salvando} className="flex-1 border border-stone-200 text-stone-600 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors disabled:opacity-50">
                    Cancelar
                  </button>
                  <button onClick={cadastrarEmprestimo} disabled={salvando || !nomePessoa.trim() || !livroId || !dataDevolucao} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                    {salvando ? 'Salvando...' : 'Cadastrar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {confirmacaoExclusao && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] px-4" onClick={() => { if (!excluindo) setConfirmacaoExclusao(null); }}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <AssignmentReturnIcon className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-800">Registrar devolução</h3>
                  <p className="text-sm text-stone-600 mt-2">Confirma a devolução do livro abaixo? O status será atualizado para disponível.</p>
                  <p className="text-sm font-medium text-stone-800 mt-2">{confirmacaoExclusao.livroTitulo}</p>
                  <p className="text-xs text-stone-500 mt-1">Devolvido por: {confirmacaoExclusao.nomePessoa}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setConfirmacaoExclusao(null)} disabled={excluindo} className="px-4 py-2.5 rounded-lg text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors disabled:opacity-50">
                  Cancelar
                </button>
                <button onClick={excluirEmprestimo} disabled={excluindo} className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50">
                  {excluindo ? 'Registrando...' : 'Confirmar devolução'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Emprestimos;