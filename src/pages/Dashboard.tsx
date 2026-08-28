import { useEffect, useMemo, useState } from 'react';
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
  dataDevolucao: string;
}

type StatusEmprestimo =
  | 'ATIVO'
  | 'ATRASADO'
  | 'DEVOLVIDO';

const DEVOLVIDOS_STORAGE_KEY =
  'bookshelf_emprestimos_devolvidos';

const Dashboard = () => {
  const [livros, setLivros] =
    useState<Livro[]>([]);

  const [emprestimos, setEmprestimos] =
    useState<Emprestimo[]>([]);

  const [devolvidos, setDevolvidos] =
    useState<number[]>([]);

  const carregarDados = async () => {
    try {
      const [
        livrosResponse,
        emprestimosResponse,
      ] = await Promise.all([
        api.get(
          '/livros?page=0&size=100'
        ),
        api.get('/emprestimos'),
      ]);

      setLivros(
        livrosResponse.data.content
      );

      setEmprestimos(
        emprestimosResponse.data
      );
    } catch (error) {
      console.error(
        'Erro ao carregar dashboard:',
        error
      );
    }
  };

  const carregarDevolvidos = () => {
    try {
      const dados =
        localStorage.getItem(
          DEVOLVIDOS_STORAGE_KEY
        );

      if (!dados) {
        setDevolvidos([]);
        return;
      }

      const ids = JSON.parse(dados);

      if (Array.isArray(ids)) {
        setDevolvidos(ids);
      }
    } catch (error) {
      console.error(
        'Erro ao carregar devoluções:',
        error
      );

      setDevolvidos([]);
    }
  };

  useEffect(() => {
    carregarDados();
    carregarDevolvidos();
  }, []);

  const hoje = useMemo(() => {
    const data = new Date();

    data.setHours(0, 0, 0, 0);

    return data;
  }, []);

  const obterStatus = (
    emprestimo: Emprestimo
  ): StatusEmprestimo => {
    /*
     * Primeiro verifica se o usuário
     * marcou o empréstimo como devolvido.
     */
    if (
      devolvidos.includes(
        emprestimo.id
      )
    ) {
      return 'DEVOLVIDO';
    }

    /*
     * dataDevolucao é a data prevista.
     */
    const dataPrevista =
      new Date(
        `${emprestimo.dataDevolucao}T00:00:00`
      );

    if (dataPrevista < hoje) {
      return 'ATRASADO';
    }

    return 'ATIVO';
  };

  const total =
    livros.length;

  const disponiveis =
    livros.filter(
      (livro) =>
        livro.status ===
        'DISPONIVEL'
    ).length;

  const emprestados =
    livros.filter(
      (livro) =>
        livro.status ===
        'EMPRESTADO'
    ).length;

  const emprestimosAtivos =
    emprestimos.filter(
      (emprestimo) =>
        obterStatus(
          emprestimo
        ) !== 'DEVOLVIDO'
    ).length;

  const emprestimosAtrasados =
    emprestimos.filter(
      (emprestimo) =>
        obterStatus(
          emprestimo
        ) === 'ATRASADO'
    ).length;

  const cards = [
    {
      label: 'Total de Livros',
      value: total,
      icon: (
        <AutoStoriesIcon className="text-amber-600" />
      ),
    },
    {
      label: 'Disponíveis',
      value: disponiveis,
      icon: (
        <CheckCircleIcon className="text-green-500" />
      ),
    },
    {
      label: 'Emprestados',
      value: emprestados,
      icon: (
        <SwapHorizIcon className="text-orange-400" />
      ),
    },
    {
      label: 'Empréstimos Ativos',
      value: emprestimosAtivos,
      icon: (
        <AssignmentIcon className="text-blue-400" />
      ),
    },
  ];

  const emprestimosRecentes =
    emprestimos.slice(0, 5);

  const livrosRecentes =
    [...livros]
      .reverse()
      .slice(0, 4);

  const obterClasseStatus = (
    status: StatusEmprestimo
  ) => {
    if (status === 'DEVOLVIDO') {
      return 'bg-stone-100 text-stone-500';
    }

    if (status === 'ATRASADO') {
      return 'bg-red-100 text-red-700';
    }

    return 'bg-green-100 text-green-700';
  };

  const obterTextoStatus = (
    status: StatusEmprestimo
  ) => {
    if (status === 'DEVOLVIDO') {
      return 'Devolvido';
    }

    if (status === 'ATRASADO') {
      return 'Atrasado';
    }

    return 'Ativo';
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Cabeçalho */}
        <div className="mb-8">

          <h2 className="text-2xl font-bold text-stone-800">
            Dashboard
          </h2>

          <p className="text-stone-500 text-sm mt-1">
            Visão geral do seu acervo
          </p>

        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl shadow-sm p-5"
            >

              <div className="mb-3">
                {card.icon}
              </div>

              <p className="text-2xl font-bold text-stone-800">
                {card.value}
              </p>

              <p className="text-stone-500 text-sm mt-1">
                {card.label}
              </p>

            </div>
          ))}

        </div>

        {/* Conteúdo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Empréstimos recentes */}
          <div className="bg-white rounded-2xl shadow-sm p-6">

            <div className="flex justify-between items-center mb-4">

              <div>
                <h3 className="font-semibold text-stone-800">
                  Empréstimos Recentes
                </h3>

                {emprestimosAtrasados > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    {emprestimosAtrasados}{' '}
                    empréstimo
                    {emprestimosAtrasados !== 1
                      ? 's'
                      : ''}{' '}
                    atrasado
                    {emprestimosAtrasados !== 1
                      ? 's'
                      : ''}
                  </p>
                )}

              </div>

            </div>

            {emprestimosRecentes.length === 0 ? (
              <p className="text-stone-400 text-sm">
                Nenhum empréstimo registrado.
              </p>
            ) : (
              <ul className="space-y-3">

                {emprestimosRecentes.map(
                  (emprestimo) => {

                    const status =
                      obterStatus(
                        emprestimo
                      );

                    return (
                      <li
                        key={
                          emprestimo.id
                        }
                        className="flex justify-between items-center gap-3"
                      >

                        <div className="min-w-0">

                          <p className="text-sm font-medium text-stone-800 truncate">
                            {
                              emprestimo.livroTitulo
                            }
                          </p>

                          <p className="text-xs text-stone-500">
                            {
                              emprestimo.nomePessoa
                            }
                          </p>

                        </div>

                        <span
                          className={`flex-shrink-0 text-xs px-2 py-1 rounded-full font-medium ${obterClasseStatus(
                            status
                          )}`}
                        >
                          {obterTextoStatus(
                            status
                          )}
                        </span>

                      </li>
                    );
                  }
                )}

              </ul>
            )}

          </div>

          {/* Livros recentes */}
          <div className="bg-white rounded-2xl shadow-sm p-6">

            <div className="flex justify-between items-center mb-4">

              <h3 className="font-semibold text-stone-800">
                Adicionados Recentemente
              </h3>

            </div>

            {livrosRecentes.length === 0 ? (
              <p className="text-stone-400 text-sm">
                Nenhum livro cadastrado.
              </p>
            ) : (
              <ul className="space-y-3">

                {livrosRecentes.map(
                  (livro) => (
                    <li
                      key={livro.id}
                      className="flex items-center gap-3"
                    >

                      <div className="w-10 h-14 flex-shrink-0 bg-stone-100 rounded overflow-hidden flex items-center justify-center">

                        {livro.capaUrl ? (
                          <img
                            src={livro.capaUrl}
                            alt={livro.titulo}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <AutoStoriesIcon
                            className="text-stone-400"
                            fontSize="small"
                          />
                        )}

                      </div>

                      <div className="min-w-0">

                        <p className="text-sm font-medium text-stone-800 truncate">
                          {livro.titulo}
                        </p>

                        <p className="text-xs text-stone-500 truncate">
                          {livro.autorNome}
                        </p>

                      </div>

                    </li>
                  )
                )}

              </ul>
            )}

          </div>

        </div>

      </main>
    </div>
  );
};

export default Dashboard;