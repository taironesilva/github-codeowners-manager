#!/usr/bin/env node

const path = require('path');
const config = require('./config/config');
const Logger = require('./utils/logger');
const JSONValidator = require('./validators/jsonValidator');
const GitHubValidator = require('./validators/githubValidator');
const RepoHandler = require('./handlers/repoHandler');
const FileService = require('./services/fileService');

class Application {
  constructor() {
    this.config = config;
    this.repoHandler = new RepoHandler(config);
    this.results = [];
  }

  async initialize() {
    Logger.title('🚀 GITHUB CODEOWNERS MANAGER');
    Logger.info('Inicializando aplicação...');

    // Validar GitHub CLI
    const cliValid = await GitHubValidator.validateCLI();
    if (!cliValid.valid) {
      throw new Error('GitHub CLI não disponível');
    }

    // Validar autenticação
    const authValid = await GitHubValidator.validateAuth();
    if (!authValid.valid) {
      throw new Error('Falha na autenticação');
    }

    // Validar permissões do token
    const permissionsValid = await GitHubValidator.validateTokenPermissions();
    if (!permissionsValid.valid) {
      Logger.warning('O token pode não ter permissões suficientes');
      Logger.warning('   Algumas operações podem falhar');
    }

    Logger.success('Aplicação inicializada com sucesso');
  }

  async loadRepositories(jsonPath) {
    Logger.section('Carregando repositórios');

    if (!jsonPath) {
      throw new Error('Caminho do arquivo JSON é obrigatório');
    }

    const validation = JSONValidator.validateFile(jsonPath);
    
    if (!validation.valid) {
      throw new Error(`Falha ao validar JSON: ${validation.error}`);
    }

    if (validation.warnings && validation.warnings.length > 0) {
      validation.warnings.forEach(warning => {
        Logger.warning(warning);
      });
    }

    Logger.success(`${validation.data.length} repositórios carregados`);
    return validation.data;
  }

  async processRepositories(repos) {
    Logger.title('📊 PROCESSANDO REPOSITÓRIOS');
    Logger.info(`Total: ${repos.length}`);
    Logger.info(`Filtros: Sigla="${this.config.VALIDATION.SIGLA_VALIDA}", Tipo="${this.config.VALIDATION.TIPO_PLATAFORMA_VALIDO}"`);

    let processed = 0;
    let skipped = 0;
    let failed = 0;

    for (const repo of repos) {
      const result = await this.repoHandler.processRepository(repo);
      this.results.push(result);

      if (result.status === 'success') processed++;
      else if (result.status === 'skipped') skipped++;
      else if (result.status === 'failed') failed++;
    }

    // Resumo final
    Logger.title('📈 RESUMO FINAL');
    Logger.success(`✅ Processados com sucesso: ${processed}`);
    Logger.warning(`⏭️  Ignorados (critérios): ${skipped}`);
    Logger.error(`❌ Falhas: ${failed}`);
    Logger.info(`📝 Total: ${repos.length}`);

    return { processed, skipped, failed, total: repos.length };
  }

  async generateReport(outputPath = 'report.json') {
    Logger.section('Gerando relatório');
    const report = await FileService.createReport(this.results, outputPath);
    Logger.success(`Relatório salvo em: ${outputPath}`);
    return report;
  }

  async run(jsonPath, outputPath = 'report.json') {
    try {
      // Inicialização
      await this.initialize();

      // Carregar repositórios
      const repos = await this.loadRepositories(jsonPath);

      // Processar
      await this.processRepositories(repos);

      // Gerar relatório
      await this.generateReport(outputPath);

      Logger.title('✅ PROCESSAMENTO CONCLUÍDO');
      
      const failed = this.results.filter(r => r.status === 'failed').length;
      if (failed > 0) {
        process.exit(1);
      } else {
        process.exit(0);
      }

    } catch (error) {
      Logger.error(`Erro fatal: ${error.message}`);
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }
}

// Executar
const app = new Application();
const jsonPath = process.argv[2];
const outputPath = process.argv[3] || 'report.json';

if (!jsonPath) {
  Logger.error('Uso: node src/index.js <caminho-do-json> [caminho-do-relatorio]');
  Logger.error('Exemplo: node src/index.js repositorios.json report.json');
  process.exit(1);
}

app.run(jsonPath, outputPath);

module.exports = Application;