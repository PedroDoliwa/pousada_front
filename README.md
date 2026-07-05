# Sistema de Pousada — Frontend

Interface web para gestão de pousadas: reservas, quartos, hóspedes, calendário e relatórios. Consome a API ASP.NET Core do backend.

## Stack

- **Next.js 16** (App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS 4**

## Estrutura do projeto

```
src/
├── app/                    # Rotas e layouts (Next.js)
│   ├── (auth)/             # Login, registro, recuperação de senha
│   ├── (dashboard)/        # Área logada (dashboard, reservas, etc.)
│   └── api/                # Route handlers (logout, upload de fotos)
├── features/               # Módulos por domínio
│   ├── auth/               # Autenticação e sessão
│   ├── pousada/            # Pousadas e seleção da pousada ativa
│   ├── reservas/           # Reservas
│   ├── quartos/            # Quartos
│   ├── hospedes/           # Hóspedes
│   ├── calendario/         # Calendário de ocupação
│   ├── calendarios/        # Integrações iCal
│   ├── dashboard/          # Layout, sidebar e visão geral
│   ├── relatorios/         # Relatórios
│   ├── consulta-inteligente/
│   └── conta/              # Configurações do usuário
├── services/api/           # Cliente HTTP e chamadas REST ao backend
├── components/             # Componentes compartilhados (ui, layout)
└── types/                  # Tipos e DTOs
```

Cada feature concentra componentes, actions e utilitários do seu domínio. As páginas em `app/` importam esses módulos e ficam enxutas.

## Como funciona

1. **Autenticação** — O usuário faz login em `/login`. O JWT fica em cookie httpOnly. O `middleware.ts` protege as rotas do dashboard e redireciona para o login quando não há sessão.

2. **API** — As telas usam **Server Actions** e o cliente em `services/api/` para falar com o backend. A URL base vem da variável `NEXT_PUBLIC_API_URL`.

3. **Pousada ativa** — O usuário pode ter várias pousadas. A selecionada fica no contexto (`use-active-pousada`) e filtra dados nas demais telas.

4. **Área logada** — Layout com sidebar (`dashboard-chrome`) e navegação entre: Dashboard, Pousada, Quartos, Hóspedes, Reservas, Calendário, Integrações iCal, Consulta Inteligente, Relatórios e Configurações.

## Como rodar

```bash
npm install
cp .env.local.example .env.local   # ajuste NEXT_PUBLIC_API_URL
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). O backend precisa estar rodando na URL configurada no `.env.local`.

## Scripts

| Comando       | Descrição              |
|---------------|------------------------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção   |
| `npm run start` | Servidor de produção |
| `npm run lint`  | ESLint              |
