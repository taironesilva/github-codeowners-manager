const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  // Configurações do GitHub
  GITHUB: {
    TOKEN: process.env.GITHUB_TOKEN || '',
    BASE_URL: process.env.GITHUB_API_URL || 'https://api.github.com',
    TIMEOUT: Number(process.env.TIMEOUT) || 30000, // 30 segundos
    MAX_RETRIES: Number(process.env.MAX_RETRIES) || 3,
    RETRY_DELAY: Number(process.env.RETRY_DELAY) || 2000 // 2 segundos
  },

  // Configurações de validação
  VALIDATION: {
    SIGLA_VALIDA: process.env.SIGLA_VALIDA || '',
    TIPO_PLATAFORMA_VALIDO: process.env.TIPO_PLATAFORMA_VALIDO || 'Plataforma Mobile'
  },

  // Configurações de PR
  PR: {
    BRANCH_NAME: process.env.BRANCH_NAME || `feature/Adiciona_CODEOWNERS-${Date.now()}`,
    COMMIT_MESSAGE: process.env.PR_COMMIT_MESSAGE || 'Adiciona arquivo CODEOWNERS',
    TITLE: process.env.PR_TITLE || 'Adiciona arquivo CODEOWNERS',
    BODY: process.env.PR_BODY || 'Este PR adiciona automaticamente o arquivo CODEOWNERS ao repositório.'
  },

  // Configurações de arquivo
  FILE: {
    CODEOWNERS_CONTENT: process.env.CODEOWNERS_CONTENT || '#Arquivo CODEOWNER CRIADO COM SUCESSO\n#PROPRIETARIOS DO DIRETORIO:\n@tairone_codeowner_exemplo',
    CODEOWNERS_PATH: process.env.CODEOWNERS_PATH || '.github/CODEOWNERS'
  }
};