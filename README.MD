Aqui está o arquivo completo já formatado:

markdown
# 🚀 GitHub CODEOWNERS Manager

## 📋 Sobre o Projeto
O **GitHub CODEOWNERS Manager** é uma ferramenta em **Node.js** que automatiza a gestão de arquivos `CODEOWNERS` em repositórios GitHub.  
Ele valida, verifica e cria automaticamente arquivos via Pull Requests, garantindo conformidade com as políticas de propriedade de código.

---

## 🎯 Principais Funcionalidades
- ✅ **Validação de repositórios** — Filtra por sigla e tipo de plataforma  
- ✅ **Verificação automática** — Checa existência e conteúdo do CODEOWNERS  
- ✅ **Criação inteligente** — Cria CODEOWNERS via PR quando necessário  
- ✅ **Validação de conteúdo** — Detecta arquivos vazios ou apenas com comentários  
- ✅ **Validação de permissões** — Confere se o token possui permissões adequadas  
- ✅ **Sistema de retry** — Tentativas automáticas em caso de falha  
- ✅ **Relatórios detalhados** — Gera JSON com todos os resultados  
- ✅ **Logs profissionais** — Com cores e níveis de log  

---

## 🏗️ Estrutura do Projeto
```text
github-codeowners-manager/
├── src/
│   ├── index.js              # Ponto de entrada principal
│   ├── config/
│   │   └── config.js         # Configurações centralizadas
│   ├── services/
│   │   ├── githubService.js  # Operações com GitHub API
│   │   └── fileService.js    # Operações com arquivos
│   ├── validators/
│   │   ├── githubValidator.js # Validações do GitHub
│   │   ├── jsonValidator.js   # Validações de JSON
│   │   └── repoValidator.js   # Validações de repositório
│   ├── utils/
│   │   ├── logger.js         # Logger profissional
│   │   └── retry.js          # Sistema de retry
│   └── handlers/
│       └── repoHandler.js    # Lógica principal de processamento
├── repositorios              # Local do arquivo de repositório
├── logs                      # Local do arquivo de logs
├── .env.example              # Exemplo de variáveis de ambiente
├── .gitignore                # Arquivos ignorados pelo Git
├── package.json              # Dependências e scripts
└── README.md                 # Esta documentação
📦 Dependências
json
{
  "chalk": "^4.1.2",
  "dotenv": "^16.0.3"
}
🔧 Pré-requisitos
Node.js >= 14.0.0

npm >= 6.0.0

GitHub CLI (gh)

bash
node --version
npm --version
gh auth login
🚀 Instalação
bash
git clone https://github.com/---/github-codeowners-manager.git
cd github-codeowners-manager

# Instale as dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
📝 Como Usar
1. Criar arquivo repositorios.json
json
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
2. Executar
bash
# Execução básica
npm start repositorios.json

# Com relatório personalizado
npm start repositorios.json meu-relatorio.json

# Modo debug
DEBUG=true npm start repositorios.json
⚙️ Configuração Avançada
Variáveis de Ambiente
Variável	Descrição	Obrigatório
GITHUB_TOKEN	Token	✅ Sim
DEBUG	true/false	❌ Não


Arquivo src/config/config.js
js
module.exports = {
  GITHUB: {
    TOKEN: process.env.GITHUB_TOKEN || '',
    TIMEOUT: 30000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000
  },
  VALIDATION: {
    SIGLA_VALIDA: 'mov',
    TIPO_PLATAFORMA_VALIDO: 'Mobile'
  },
  PR: {
    BRANCH_NAME: `codeowners-${Date.now()}`,
    COMMIT_MESSAGE: 'Adiciona arquivo CODEOWNERS',
    TITLE: 'Adiciona arquivo CODEOWNERS',
    BODY: 'Este PR adiciona automaticamente o arquivo CODEOWNERS ao repositório.'
  },
  FILE: {
    CODEOWNERS_CONTENT: `#Arquivo CODEOWNER CRIADO COM SUCESSO\n#PROPRIETARIOS DO DIRETORIO: `,
    CODEOWNERS_PATH: '.github/CODEOWNERS'
  }
};
📊 Relatório de Saída
Exemplo de report.json:

json
{
  "timestamp": "2026-07-09T10:30:00.000Z",
  "summary": {
    "total": 10,
    "success": 8,
    "failed": 1,
    "skipped": 1
  }
}
🔍 Validações Realizadas
GitHub CLI — Verifica se gh está instalado

Autenticação — Testa token/CLI

Permissões — Confere contents:write, pull_requests:write, metadata:read

Arquivo JSON — Estrutura, sintaxe e campos obrigatórios

URL GitHub — Formato válido

Critérios — Sigla e tipo de plataforma

Repositório — Existência no GitHub

CODEOWNERS — Existência, vazio ou apenas comentários

🧪 Testes
bash
# Executar testes
npm test

# Modo watch
npm test -- --watch

# Cobertura
npm test -- --coverage