# 📚 Bookshelf Manager — Frontend

Interface web do sistema de gerenciamento de acervo pessoal de livros com controle de empréstimos. Desenvolvido para uso real por uma psicóloga que precisava rastrear quais livros estavam em sua casa e quais estavam emprestados.

🌐 **[Acesse a aplicação](https://bookshelf-manager-two.vercel.app)**
🔗 **[Repositório do Backend](https://github.com/murilosantostelles/bookshelf-manager)**

---

## 🎯 Sobre o Projeto

O frontend consome a API RESTful do Bookshelf Manager, oferecendo uma interface limpa e responsiva para gerenciar o acervo de livros, controlar empréstimos e visualizar o estado atual da biblioteca.

---

## ✨ Funcionalidades

- Cadastro e login de usuário com autenticação JWT
- Dashboard com visão geral do acervo (total de livros, disponíveis, emprestados)
- Listagem de livros com filtros por título, autor, categoria e status
- Cadastro de livros com busca automática na **Open Library API** — capa, sinopse e autor preenchidos automaticamente
- Cadastro manual de livros não encontrados na API
- Controle de empréstimos com registro de devolução
- Histórico de empréstimos com filtro por status (ativos/atrasados)
- Interface responsiva para desktop e mobile

---

## 🛠️ Tecnologias Utilizadas

- **React 18** + **TypeScript**
- **Vite** — bundler moderno
- **Tailwind CSS** — estilização utilitária
- **Axios** — requisições HTTP com interceptor JWT automático
- **React Router DOM** — navegação entre páginas
- **Material Icons** — ícones
- **Open Library API** — busca e preenchimento automático de dados dos livros

---

## 🔐 Autenticação

O token JWT é armazenado no `localStorage` após o login e adicionado automaticamente em todas as requisições via interceptor do Axios:

```ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📁 Estrutura do Projeto

```
src/
├── api/
│   └── axios.ts          # Configuração do Axios com interceptor JWT
├── components/
│   ├── Navbar.tsx         # Barra de navegação
│   └── ModalAdicionarLivro.tsx  # Modal de cadastro de livro
├── pages/
│   ├── Login.tsx          # Tela de login
│   ├── Register.tsx       # Tela de cadastro
│   ├── Dashboard.tsx      # Visão geral do acervo
│   ├── Livros.tsx         # Listagem e gerenciamento de livros
│   └── Emprestimos.tsx    # Histórico e controle de empréstimos
└── routes/
    └── AppRoutes.tsx      # Configuração das rotas
```

---

## 🚀 Como Rodar Localmente

**Pré-requisitos:** Node.js 18+, backend rodando localmente

**1. Clone o repositório**
```bash
git clone https://github.com/murilosantostelles/bookshelf-manager-frontend.git
cd bookshelf-manager-frontend
```

**2. Instale as dependências**
```bash
npm install
```

**3. Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz:
```
VITE_API_URL=http://localhost:8080
```

**4. Rode a aplicação**
```bash
npm run dev
```

Acessa `http://localhost:5173`

---

## 🌐 Deploy

O frontend está deployado na **Vercel** com deploy automático a cada push na branch `main`.

O backend está deployado no **Render** e o banco de dados no **Neon** (PostgreSQL).

---

## 👨‍💻 Autor

**Murilo Santos Telles**
Estudante de Engenharia de Software — UniAcademia Centro Universitário

[![LinkedIn](https://img.shields.io/badge/LinkedIn-murilo--santos--telles-blue)](https://www.linkedin.com/in/murilo-santos-telles)
[![GitHub](https://img.shields.io/badge/GitHub-murilosantostelles-black)](https://github.com/murilosantostelles)
