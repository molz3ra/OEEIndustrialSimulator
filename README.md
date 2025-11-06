

---

````markdown
# 🏭 OEE Industrial Simulator

OEE Industrial Simulator é uma aplicação **Full Stack** voltada para simular e visualizar a eficiência operacional de máquinas e processos industriais (OEE - Overall Equipment Effectiveness).  
O sistema oferece uma interface moderna e intuitiva para controle de paradas, cálculo de eficiência e acompanhamento de eventos em tempo real.

---

## 🚀 Tecnologias Utilizadas

### **Frontend (Client)**
- ⚛️ **React + TypeScript** – Framework moderno para construção da interface.
- ⚡ **Vite** – Ferramenta de build ultrarrápida para desenvolvimento React.
- 🎨 **TailwindCSS** – Framework CSS utilitário para estilização rápida e responsiva.
- 🧩 **ShadCN/UI** – Biblioteca de componentes moderna e elegante, baseada em Radix UI.
- 📊 **Recharts** – Biblioteca de gráficos reativa usada para visualização de dados industriais.
- 🔄 **React Query (TanStack Query)** – Para gerenciamento de estado e sincronização de dados com o backend.

---

### **Backend (Server)**
- 🧠 **Node.js + Express + TypeScript** – Servidor leve e robusto para lidar com APIs REST.
- 🗄️ **Drizzle ORM** – ORM moderno e tipado para manipulação segura de dados.
- 🔌 **Vite Server Integration** – O servidor Express é integrado ao Vite, permitindo desenvolvimento unificado do front e back.

---

### **Banco de Dados**
- 🧰 **SQLite / PostgreSQL (via Drizzle)** – Suporte configurável; ideal tanto para desenvolvimento local quanto produção.
- 🌿 As variáveis de ambiente são controladas pelo `.env` (exemplo em `.env.example`).

---

## ⚙️ Instalação e Execução

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/molz3ra/OEEIndustrialSimulator.git
   cd OEEIndustrialSimulator
````

2. **Instalar dependências**

   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente**

   * Crie um arquivo `.env` na raiz e adicione:

     ```env
     DATABASE_URL="file:./dev.db"
     NODE_ENV=development
     ```

4. **Rodar o servidor**

   * No Windows:

     ```bash
     npx cross-env NODE_ENV=development tsx server/index.ts
     ```
   * Ou, se configurado no `package.json`:

     ```bash
     npm run dev
     ```

5. **Acessar o projeto**

   * O frontend será servido em [http://localhost:5173](http://localhost:5173)
   * A API backend roda em [http://localhost:3000](http://localhost:3000) (dependendo da configuração)

---

## 📈 Funcionalidades Principais

* Visualização de **eficiência (OEE)** em tempo real.
* Registro de **paradas de máquina** e suas causas.
* Análise de **distribuição de paradas** por gráfico.
* Painel de controle com **indicadores visuais e estatísticas**.
* Interface moderna e responsiva.

---

## 📦 Estrutura do Projeto

```
OEEIndustrialSimulator/
├── client/             # Aplicação React (frontend)
│   ├── src/
│   │   ├── components/ # Componentes e UI
│   │   ├── pages/      # Páginas principais (Dashboard, Home, etc.)
│   │   └── lib/        # Utilitários e hooks
├── server/             # API Express (backend)
│   ├── db.ts           # Configuração do banco de dados (Drizzle)
│   ├── routes.ts       # Rotas da API
│   └── index.ts        # Servidor principal
├── shared/             # Schemas e tipos compartilhados entre front e back
├── .env.example        # Exemplo de configuração de ambiente
├── package.json
└── vite.config.ts
```

---

## 🤝 Contribuições

Pull requests são bem-vindos!
Para grandes mudanças, abra primeiro uma issue para discutir o que você gostaria de alterar.

---

## 🧑‍💻 Autor

**Lucas Mol**
📫 [GitHub](https://github.com/molz3ra)

---

## 🛠️ Licença

Este projeto está sob a licença **MIT** – sinta-se livre para usar, modificar e distribuir.

```

---

Quer que eu te monte um **README visual com badges (React, Node, TypeScript, etc.)** pra deixar mais bonito na página do GitHub? Posso adicionar ícones e status também (como “em desenvolvimento”).
```
