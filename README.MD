# 🚀 GitHub CODEOWNERS Manager

## 📋 Sobre o Projeto
O **GitHub CODEOWNERS Manager** é uma ferramenta em **Node.js** para automatizar a criação e validação de arquivos `CODEOWNERS` em repositórios GitHub.

Ele valida arquivos de entrada, verifica repositórios, identifica necessidade de criação de `CODEOWNERS` e abre Pull Requests quando necessário.

---

## 🎯 Principais Funcionalidades
- ✅ Validação de arquivos `repositorios.json`
- ✅ Filtragem por sigla e tipo de plataforma
- ✅ Verificação da existência do arquivo `CODEOWNERS`
- ✅ Criação de branch e Pull Request para adicionar `CODEOWNERS`
- ✅ Validação de conteúdo vazio ou apenas com comentários
- ✅ Tentativas automáticas de retry em falhas transitórias
- ✅ Geração de relatório de execução em JSON
- ✅ Logs com níveis de informação para auditoria

---

## 🧱 Estrutura do Projeto
```text
github-codeowners-manager/
├── src/
│   ├── index.js
│   ├── config/
│   │   └── config.js
│   ├── handlers/
│   │   └── repoHandler.js
│   ├── services/
│   │   ├── fileService.js
│   │   └── githubService.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── retry.js
│   └── validators/
│       ├── githubValidator.js
│       ├── jsonValidator.js
│       └── repoValidator.js
├── repositorios/
│   └── repos.json
├── logs/
├── .env_example
├── .gitignore
├── package.json
└── README.MD
```

---

## 🚀 Instalação
1. Clone o repositório:
```bash
git clone https://github.com/---/github-codeowners-manager.git
cd github-codeowners-manager
```
2. Instale as dependências:
```bash
npm install
```
3. Copie o exemplo de ambiente:
```bash
cp .env_example .env
```

---

## ⚙️ Pré-requisitos
- Node.js >= 14
- npm >= 6
- GitHub CLI (`gh`)

Verifique as versões:
```bash
node --version
npm --version
gh auth status
```

---

## 📁 Configuração
O projeto usa variáveis de ambiente definidas em `.env`.

Exemplo de variáveis:
- `GITHUB_TOKEN` — Token do GitHub com permissão de `repo`
- `DEBUG` — `true` ou `false`
- `MAX_RETRIES` — número de tentativas em caso de falha
- `RETRY_DELAY` — intervalo entre tentativas em ms
- `TIMEOUT` — timeout de requisição em ms
- `SIGLA_VALIDA` — sigla para filtrar repositórios
- `TIPO_PLATAFORMA_VALIDO` — tipo de plataforma a ser validado
- `CODEOWNERS_PATH` — caminho do arquivo `CODEOWNERS`
- `CODEOWNERS_CONTENT` — conteúdo padrão do arquivo criado

O arquivo `src/config/config.js` define valores padrão e pode ser alterado conforme necessário.

---

## 🧭 Uso
1. Forneça o arquivo de repositórios serem verificados em `repositorios/repos.json`.

Exemplo de conteúdo:
```json
[
  {
    "Nome do projeto": "mov-xpto",
    "Sigla": "mov",
    "Tipo de Plataforma": "Mobile",
    "url_repositório_github": "https://github.com/mov-xpto"
  },
  {
    "Nome do projeto": "web-project",
    "Sigla": "web",
    "Tipo de Plataforma": "Web",
    "url_repositório_github": "https://github.com/web-project"
  }
]
```

2. Execute a ferramenta:
```bash
npm start repositorios/repos.json
```

3. Gerar relatório com saída personalizada:
```bash
npm start repositorios/repos.json report.json
```

4. Executar em modo debug:
```bash
DEBUG=true npm start repositorios/repos.json
```

---

## 📊 Relatório de Saída
A ferramenta pode gerar um relatório JSON com resumo da execução.

Exemplo:
```json
{
  "timestamp": "2026-07-09T10:30:00.000Z",
  "summary": {
    "total": 10,
    "success": 8,
    "failed": 1,
    "skipped": 1
  }
}
```

---

## 🔍 Validações realizadas
- Verificação de instalação do GitHub CLI
- Autenticação via token ou CLI
- Permissões do token para conteúdos e Pull Requests
- Validação do formato JSON de entrada
- Validação de URL do GitHub
- Filtragem por sigla e tipo de plataforma
- Existência do repositório no GitHub
- Existência e conteúdo do arquivo `CODEOWNERS`

---

## 🧪 Scripts úteis
```bash
npm start            # Executa o projeto
npm run dev          # Executa em modo watch
```
