// src/validators/repoValidator.js

const Logger = require('../utils/logger');

class RepoValidator {
  constructor(config) {
    // 🔧 Usa as propriedades da seção VALIDATION do config
    this.siglaValida = config.VALIDATION.SIGLA_VALIDA || 'mov';
    this.tipoPlataformaValido = config.VALIDATION.TIPO_PLATAFORMA_VALIDO || 'Mobile';
  }

  /**
   * Valida se o repositório atende aos critérios de sigla e tipo de plataforma
   */
  validateCriteria(repo) {
    const isValid = repo.Sigla === this.siglaValida && 
                    repo["Tipo de Plataforma"] === this.tipoPlataformaValido;
    
    if (!isValid) {
      Logger.debug(`   Repositório ${repo["Nome do projeto"]} não atende aos critérios`);
      Logger.debug(`   Sigla: ${repo.Sigla} (esperado: ${this.siglaValida})`);
      Logger.debug(`   Tipo: ${repo["Tipo de Plataforma"]} (esperado: ${this.tipoPlataformaValido})`);
    }
    
    return isValid;
  }

  /**
   * Valida a estrutura básica do repositório
   */
  validateRepository(repo) {
    const errors = [];
    const warnings = [];

    // Validar nome do projeto
    if (!repo["Nome do projeto"] || repo["Nome do projeto"].trim() === '') {
      errors.push('Nome do projeto vazio');
    }

    // Validar sigla
    if (!repo.Sigla) {
      errors.push('Sigla não definida');
    }

    // Validar tipo de plataforma
    if (!repo["Tipo de Plataforma"]) {
      errors.push('Tipo de Plataforma não definido');
    }

    // Validar URL do repositório
    if (!repo["url_repositório_github"]) {
      errors.push('URL do repositório não definida');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valida o conteúdo do arquivo CODEOWNERS
   * Retorna:
   * - valid: true se o arquivo tem conteúdo válido
   * - hasOwners: true se tem pelo menos um proprietário definido
   * - reason: motivo se for inválido
   */
  static validateCodeownersContent(content) {
    // Verifica se o conteúdo é nulo ou vazio
    if (!content) {
      return { 
        valid: false, 
        hasOwners: false,
        reason: 'Conteúdo nulo ou indefinido' 
      };
    }

    const trimmed = content.trim();
    
    // Verifica se está completamente vazio
    if (trimmed === '') {
      return { 
        valid: false, 
        hasOwners: false,
        reason: 'Arquivo vazio (sem conteúdo)' 
      };
    }

    // Separa as linhas ignorando linhas vazias
    const lines = trimmed.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
      return { 
        valid: false, 
        hasOwners: false,
        reason: 'Arquivo contém apenas linhas vazias' 
      };
    }

    // Separa comentários e linhas de regras
    const comments = lines.filter(line => line.trim().startsWith('#'));
    const rules = lines.filter(line => !line.trim().startsWith('#') && line.trim() !== '');

    // Verifica se há regras de CODEOWNERS
    // Uma regra é uma linha que não começa com # e tem conteúdo
    // Exemplos de regras válidas:
    //   * @org/team
    //   /docs @docs-team
    //   @user1 @user2
    const hasValidRules = rules.some(line => {
      const trimmedLine = line.trim();
      // Deve ter pelo menos um @ ou um padrão de path
      return trimmedLine.includes('@') || trimmedLine.includes('/') || trimmedLine.includes('*');
    });

    // Verifica se há proprietários definidos
    const hasOwners = rules.some(line => {
      const trimmedLine = line.trim();
      // Verifica se a linha tem um @ (menciona um usuário/equipe)
      return trimmedLine.includes('@');
    });

    // Log de debug para entender o que foi encontrado
    if (process.env.DEBUG) {
      Logger.debug(`   Linhas totais: ${lines.length}`);
      Logger.debug(`   Comentários: ${comments.length}`);
      Logger.debug(`   Regras: ${rules.length}`);
      Logger.debug(`   Tem regras válidas: ${hasValidRules}`);
      Logger.debug(`   Tem proprietários: ${hasOwners}`);
    }

    // Critérios de validação:
    // 1. Deve ter pelo menos uma regra válida
    // 2. Deve ter pelo menos um proprietário definido (opcional, mas recomendado)
    if (!hasValidRules) {
      return {
        valid: false,
        hasOwners: false,
        reason: 'Arquivo contém apenas comentários, sem regras de propriedade definidas',
        lines: lines.length,
        comments: comments.length,
        rules: rules.length
      };
    }

    // Arquivo é considerado válido se tem pelo menos uma regra
    return {
      valid: true,
      hasOwners: hasOwners,
      reason: hasOwners ? 'Arquivo válido com proprietários definidos' : 'Arquivo válido mas sem proprietários definidos',
      lines: lines.length,
      comments: comments.length,
      rules: rules.length,
      content: trimmed,
      hasOwners
    };
  }

  /**
   * Verifica se o CODEOWNERS precisa ser atualizado
   * Retorna true se o arquivo está vazio ou não tem conteúdo útil
   */
  static needsUpdate(content) {
    const validation = this.validateCodeownersContent(content);
    
    // Precisa de update se:
    // 1. For inválido (vazio ou só comentários)
    // 2. Não tiver proprietários definidos
    return !validation.valid || !validation.hasOwners;
  }

  /**
   * Verifica se o arquivo CODEOWNERS está vazio
   */
  static isEmpty(content) {
    if (!content) return true;
    const trimmed = content.trim();
    return trimmed === '';
  }

  /**
   * Verifica se o arquivo CODEOWNERS tem apenas comentários
   */
  static hasOnlyComments(content) {
    if (!content) return true;
    const lines = content.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return true;
    
    const allComments = lines.every(line => line.trim().startsWith('#'));
    return allComments;
  }

  /**
   * Obtém estatísticas do arquivo CODEOWNERS
   */
  static getStats(content) {
    if (!content) {
      return {
        totalLines: 0,
        comments: 0,
        rules: 0,
        emptyLines: 0,
        hasOwners: false
      };
    }

    const lines = content.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim() !== '');
    const comments = nonEmptyLines.filter(line => line.trim().startsWith('#'));
    const rules = nonEmptyLines.filter(line => !line.trim().startsWith('#') && line.trim() !== '');
    const hasOwners = rules.some(line => line.trim().includes('@'));

    return {
      totalLines: lines.length,
      nonEmptyLines: nonEmptyLines.length,
      comments: comments.length,
      rules: rules.length,
      emptyLines: lines.length - nonEmptyLines.length,
      hasOwners: hasOwners
    };
  }
}

module.exports = RepoValidator;