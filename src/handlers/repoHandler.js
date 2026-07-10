const Logger = require('../utils/logger');
const GitHubService = require('../services/githubService');
const RepoValidator = require('../validators/repoValidator');
const GitHubValidator = require('../validators/githubValidator');

class RepoHandler {
  constructor(config) {
    this.config = config;
    this.githubService = new GitHubService(config);
    this.repoValidator = new RepoValidator(config);
  }

  async processRepository(repo) {
    const repoName = repo["Nome do projeto"];
    const repoUrl = repo["url_repositório_github"];
    const fullRepoName = GitHubValidator.extractRepoName(repoUrl);

    Logger.section(`Processando: ${repoName}`);
    Logger.debug(`   URL: ${repoUrl}`);
    Logger.debug(`   Repositório: ${fullRepoName}`);

    // Validar critérios
    if (!this.repoValidator.validateCriteria(repo)) {
      Logger.warning(`   Repositório ignorado - não atende aos critérios`);
      return {
        name: repoName,
        status: 'skipped',
        reason: 'Não atende aos critérios de validação',
        repo: fullRepoName
      };
    }

    // Verificar se o repositório existe
    const exists = await GitHubValidator.validateRepositoryExists(fullRepoName);
    if (!exists) {
      Logger.error(`   Repositório não encontrado`);
      return {
        name: repoName,
        status: 'failed',
        reason: 'Repositório não encontrado no GitHub',
        repo: fullRepoName
      };
    }

    try {
      // Verificar CODEOWNERS
      const codeowners = await this.githubService.checkCodeowners(fullRepoName);
      
      if (codeowners.exists) {
        // Validar conteúdo do CODEOWNERS
        const contentValidation = RepoValidator.validateCodeownersContent(codeowners.content);
        
        if (contentValidation.valid) {
          Logger.success(`   CODEOWNER EXISTENTE (${contentValidation.lines} linhas)`);
          return {
            name: repoName,
            status: 'success',
            action: 'exists',
            message: 'CODEOWNER EXISTENTE',
            repo: fullRepoName,
            details: {
              lines: contentValidation.lines,
              content: codeowners.content
            }
          };
        } else {
          Logger.warning(`   CODEOWNER EXISTE MAS ESTÁ VAZIO - Criando novo...`);
          // Criar novo CODEOWNERS via PR
          const prUrl = await this.githubService.createCodeownersPR(fullRepoName);
          Logger.success(`   PR criado com sucesso: ${prUrl}`);
          return {
            name: repoName,
            status: 'success',
            action: 'created',
            message: 'CODEOWNER CRIADO VIA PR (substituindo vazio)',
            repo: fullRepoName,
            prUrl,
            details: {
              previousContent: codeowners.content,
              reason: contentValidation.reason
            }
          };
        }
      } else {
        Logger.warning(`   CODEOWNER INEXISTENTE - Criando...`);
        // Criar CODEOWNERS via PR
        const prUrl = await this.githubService.createCodeownersPR(fullRepoName);
        Logger.success(`   PR criado com sucesso: ${prUrl}`);
        return {
          name: repoName,
          status: 'success',
          action: 'created',
          message: 'CODEOWNER CRIADO VIA PR',
          repo: fullRepoName,
          prUrl
        };
      }
    } catch (error) {
      Logger.error(`   Erro ao processar: ${error.message}`);
      return {
        name: repoName,
        status: 'failed',
        reason: error.message,
        repo: fullRepoName,
        error: error
      };
    }
  }
}

module.exports = RepoHandler;