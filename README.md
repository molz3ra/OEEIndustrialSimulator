# 🏭 OEE Industrial Simulator v2.0

Sistema profissional de controle de chão de fábrica e análise de eficiência global de equipamentos (**OEE - Overall Equipment Effectiveness**) em tempo real.

Reconstruído do zero com foco em confiabilidade industrial, usabilidade direta para operadores e visão analítica para gestores.

---

## 📐 O que é OEE e como é calculado?

O **OEE** é o padrão internacional para medir a produtividade da manufatura, unindo três pilares fundamentais:

$$\text{OEE} = \text{Disponibilidade} \times \text{Performance} \times \text{Qualidade}$$

1. **Disponibilidade (Availability):**
   $$\text{Disponibilidade} = \frac{\text{Tempo Real de Operação}}{\text{Tempo Planejado do Turno}}$$
   *Impactado por paradas mecânicas, elétricas, setups e falta de material.*

2. **Performance:**
   $$\text{Performance} = \frac{\text{Peças Produzidas} \times \text{Tempo de Ciclo Ideal}}{\text{Tempo Real de Operação}}$$
   *Impactado por pequenas paradas, velocidade reduzida e micro-interrupções.*

3. **Qualidade (Quality):**
   $$\text{Qualidade} = \frac{\text{Peças Conformes (Boas)}}{\text{Total de Peças Produzidas}}$$
   *Impactado por refugos, peças com defeito e retrabalho.*

### 🎯 Faixas de Benchmark Industrial:
- 🟢 **≥ 85%:** Classe Mundial (*World Class*) — Padrão de excelência
- 🔵 **70% a 84%:** Típico / Bom — Operação estável
- 🟡 **50% a 69%:** Abaixo da Média — Oportunidade evidente de melhoria
- 🔴 **< 50%:** Crítico — Gargalo de produção severo

---

## 🚀 Tecnologias Utilizadas

### Frontend
- ⚛️ **React 18 + TypeScript 5.7**
- ⚡ **Vite 5** (Build ultrarrápido)
- 🗺️ **React Router v7**
- 🔄 **TanStack Query v5**
- 📊 **Recharts** (Pareto de perdas e gráficos temporais)
- 🌐 **i18next** (Suporte bilíngue nativo PT-BR / EN com toggle)
- 🎨 **TailwindCSS 3 + Radix UI** (Tema industrial de alto contraste)

### Backend
- 🧠 **Node.js + Express 4 + TypeScript**
- 🛡️ **Segurança em camadas:** Helmet, CORS restrito, Rate Limiting (`express-rate-limit`)
- 🔑 **Autenticação:** Sessões seguras (`express-session` + `memorystore`) com hashing `bcryptjs`
- 🗄️ **Drizzle ORM** com suporte nativo a **Neon PostgreSQL (Serverless)** e fallback em memória automático
- 🩺 **Health Check endpoint:** `/api/health`

### Testes & Qualidade
- 🧪 **Vitest 3** + **Supertest** + **React Testing Library**
- 📦 **Docker + Docker Compose**
- 🤖 **GitHub Actions CI Pipeline**

---

## 🔑 Credenciais para Teste (Seed Integrado)

O sistema já vem pré-configurado com usuários e dados de linha prontos para uso:

| Perfil | Usuário | Senha | Nível de Permissão |
|---|---|---|---|
| **Operador** | `operador` | `operador123` | Registra paradas e produção na linha |
| **Gerente** | `gerente` | `gerente123` | Acesso completo a dashboards e relatórios |
| **Administrador**| `admin` | `admin123` | Gestão de máquinas, parâmetros e usuários |

---

## ⚙️ Como Executar

### Pré-requisitos
- Node.js ≥ 20 LTS
- npm ≥ 10

### 1. Clonar e Instalar
```bash
git clone https://github.com/molz3ra/OEEIndustrialSimulator.git
cd OEEIndustrialSimulator
npm install
```

### 2. Executar em Desenvolvimento
```bash
npm run dev
```
Acesse a aplicação unificada em: **`http://localhost:5000`**

### 3. Rodar a Suíte de Testes
```bash
npm run test
```

### 4. Checagem de Tipos TypeScript
```bash
npm run check
```

### 5. Build de Produção
```bash
npm run build
npm start
```

### 6. Executar via Docker
```bash
docker compose up --build
```

---

## 📦 Estrutura do Projeto

```
OEEIndustrialSimulator/
├── client/                      # Frontend SPA React
│   ├── src/
│   │   ├── components/
│   │   │   ├── downtime/        # Botões táteis, timer em tempo real, formulário
│   │   │   ├── layout/          # Navbar, AppShell, AuthGuard
│   │   │   ├── oee/             # Gauges circulares SVG, cards de pilares
│   │   │   └── ui/              # Componentes de interface otimizados
│   │   ├── hooks/               # useAuth, useToast
│   │   ├── i18n/                # Dicionários pt-BR e en
│   │   ├── lib/                 # apiRequest, queryClient, utils
│   │   ├── pages/               # Login, Operador, Dashboard, Produção, Máquinas
│   │   └── router.tsx           # Configuração de rotas React Router v7
├── server/                      # Backend API REST
│   ├── middleware/              # Auth guard, security headers, rate limit
│   ├── routes/                  # auth, machines, downtime, production, oee
│   ├── storage/                 # Camada de persistência (MemStorage e DatabaseStorage)
│   ├── db.ts                    # Conexão Drizzle / Neon
│   └── index.ts                 # Bootstrap do Express e servidor unificado
├── shared/                      # Código compartilhado entre front e back
│   ├── schema.ts                # Schemas Drizzle + validações Zod
│   ├── types.ts                 # Tipagens TypeScript compartilhadas
│   ├── enums.ts                 # Categorias industriais de parada e turnos
│   └── oee.ts                   # Função pura matemática de cálculo de OEE
├── tests/                       # Testes automatizados Vitest + Supertest
│   ├── client/                  # Testes da fórmula matemática e componentes
│   └── server/                  # Testes de rotas, autenticação e regras de negócio
├── Dockerfile                   # Build multi-stage para produção
├── docker-compose.yml           # Orquestração de container
└── package.json
```

---

## 🛠️ Licença

Este projeto está sob a licença **MIT**.
