## 📋 Sobre o Projeto

O **GitHub CODEOWNERS Manager** é uma ferramenta profissional em Node.js que automatiza a gestão de arquivos CODEOWNERS em repositórios GitHub. Ela valida, verifica e cria automaticamente arquivos CODEOWNERS via Pull Requests, garantindo que todos os repositórios estejam em conformidade com as políticas de propriedade de código.

### 🎯 Principais Funcionalidades

- ✅ **Validação de repositórios** - Filtra por sigla e tipo de plataforma
- ✅ **Verificação automática** - Checa existência e conteúdo do CODEOWNERS
- ✅ **Criação inteligente** - Cria CODEOWNERS via PR quando necessário
- ✅ **Validação de conteúdo** - Detecta arquivos vazios ou com apenas comentários
- ✅ **Validação de permissões** - Verifica se o token tem permissões adequadas
- ✅ **Sistema de retry** - Tentativas automáticas em caso de falha
- ✅ **Relatórios detalhados** - Gera JSON com todos os resultados
- ✅ **Logs profissionais** - Com cores e níveis de log

## 🏗️ Estrutura do Projeto

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
├── repositorios              # Local do arquivo de repositorio
├── logs                      # Local do arquivo de logs
├── .env.example              # Exemplo de variáveis de ambiente
├── .gitignore                # Arquivos ignorados pelo Git
├── package.json              # Dependências e scripts
└── README.md                 # Esta documentação


## 📦 Dependências

```json
{
  "chalk": "^4.1.2",        // Cores no terminal
  "dotenv": "^16.0.3"       // Variáveis de ambiente
}


🔧 Pré-requisitos
1. Node.js
bash
node --version  # >= 14.0.0
npm --version   # >= 6.0.0
GitHub CLI (gh)


2. Autenticação GitHub
bash
# Login no GitHub CLI
gh auth login

# Ou defina token como variável de ambiente
export GITHUB_TOKEN="seu-token-aqui"


🚀 Instalação

git clone https://github.com/---/github-codeowners-manager.git
cd github-codeowners-manager

#Instale as dependências
npm install

#Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com seu token


📝 Como Usar
1. Preparar o Arquivo JSON
Crie um arquivo repositorios.json com a lista de repositórios:

json
[
  {
    "Nome do projeto": "mov-xpto",
    "Sigla": "mov",
    "Tipo de Plataforma": "Mobile",
    "url_repositório_github": "https://github.com/mov-xpto"
  },
  {
    "Nome do projeto": "mov-xpto2",
    "Sigla": "mov",
    "Tipo de Plataforma": "Mobile",
    "url_repositório_github": "https://github.com/mov-xpto2"
  },
  {
    "Nome do projeto": "web-project",
    "Sigla": "web",
    "Tipo de Plataforma": "Web",
    "url_repositório_github": "https://github.com/web-project"
  }
]

2. Executar

# Execução básica
npm start repositorios.json

# Com relatório personalizado
npm start repositorios.json meu-relatorio.json

# Modo debug
DEBUG=true npm start repositorios.json

# Com variável de ambiente
GITHUB_TOKEN="seu-token" npm start repositorios.json

3. Exemplo de Saída
🚀 GITHUB CODEOWNERS MANAGER
==================================================
ℹ️  Inicializando aplicação...
✅ GitHub CLI encontrado: gh version 2.40.0
✅ Autenticação GitHub bem-sucedida (Usuário: seu-usuario)
✅ Token possui todas as permissões necessárias
✅ Aplicação inicializada com sucesso

--- Carregando repositórios
✅ 3 repositórios carregados

📊 PROCESSANDO REPOSITÓRIOS
==================================================
ℹ️  Total: 3
ℹ️  Filtros: Sigla="mov", Tipo="Mobile"

--- Processando: mov-xpto
   📦 Repositório: mov-xpto
   🔎 Verificando CODEOWNERS...
   ✅ CODEOWNER EXISTENTE

--- Processando: mov-xpto2
   📦 Repositório: mov-xpto2
   🔎 Verificando CODEOWNERS...
   ⚠️  CODEOWNER INEXISTENTE - Criando...
   ✅ PR criado com sucesso: https://github.com/mov-xpto2/pull/1

--- Processando: web-project
   ⚠️  Repositório ignorado - não atende aos critérios de validação

📈 RESUMO FINAL
==================================================
✅ Processados com sucesso: 2
⏭️  Ignorados (critérios): 1
❌ Falhas: 0
📝 Total: 3

--- Gerando relatório
✅ Relatório salvo em: report.json

✅ PROCESSAMENTO CONCLUÍDO
==================================================


⚙️ Configuração Avançada

Variáveis de Ambiente

|  Variável	  |  Descrição  | Obrigatório|
|GITHUB_TOKEN	|    Token    |	  ✅ Sim   |
|Modo debug   |(true/false) |	  ❌ Não   |

⚙️ Configurações no src/config/config.js

module.exports = {
  GITHUB: {
    TOKEN: process.env.GITHUB_TOKEN || '',
    TIMEOUT: 30000,           // Timeout em ms
    MAX_RETRIES: 3,           // Máximo de tentativas
    RETRY_DELAY: 2000         // Delay entre tentativas em ms
  },
  VALIDATION: {
    SIGLA_VALIDA: 'mov',      // Sigla para validação
    TIPO_PLATAFORMA_VALIDO: 'Mobile'  // Tipo para validação
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
O relatório gerado (report.json) contém:
{
  "timestamp": "2026-07-09T10:30:00.000Z",
  "summary": {
    "total": 10,
    "success": 8,
    "failed": 1,
    "skipped": 1
  },
  "results": [
    {
      "name": "mov-xpto",
      "status": "success",
      "action": "exists",
      "message": "CODEOWNER EXISTENTE",
      "repo": "mov-xpto",
      "details": {
        "lines": 5,
        "content": "# CODEOWNERS\n* @team/owners"
      }
    },
    {
      "name": "mov-xpto2",
      "status": "success",
      "action": "created",
      "message": "CODEOWNER CRIADO VIA PR",
      "repo": "mov-xpto2",
      "prUrl": "https://github.com/mov-xpto2/pull/1"
    },
    {
      "name": "web-project",
      "status": "skipped",
      "reason": "Não atende aos critérios de validação",
      "repo": "web-project"
    }
  ]
}

🔍 Validações Realizadas
1. Validação do GitHub CLI ✅
Verifica se a ferramenta gh está instalada e acessível.

2. Validação de Autenticação ✅
Testa se o token/autenticação está funcionando corretamente.

3. Validação de Permissões do Token ✅
Verifica se o token tem as permissões necessárias:

contents:write - Para criar/atualizar arquivos

pull_requests:write - Para criar PRs

metadata:read - Para ler informações do repo

4. Validação do Arquivo JSON ✅
- Existência do arquivo
- Sintaxe JSON válida
- Estrutura correta (array)
- Campos obrigatórios presentes
- Nomes duplicados

5. Validação de URL do GitHub ✅
- Verifica se a URL está no formato correto.

6. Validação de Critérios ✅
- Sigla corresponde ao valor configurado
- Tipo de plataforma corresponde ao valor configurado

7. Validação de Repositório Existente ✅
- Confirma se o repositório realmente existe no GitHub.

8. Validação do CODEOWNERS ✅
- Verifica se o arquivo existe
- Verifica se o arquivo está vazio
- Verifica se contém apenas comentários

🧪 Testes

# Executar testes
npm test

# Modo watch
npm test -- --watch

# Cobertura de testes
npm test -- --coverage