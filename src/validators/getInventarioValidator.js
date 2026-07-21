const Logger = require('../utils/logger');

class GetInventarioValidator {
  /**
   * Valida a resposta da API de inventário
   */
  static validateResponse(data) {
    const errors = [];
    const warnings = [];

    // Verificar se é um objeto válido
    if (!data || typeof data !== 'object') {
      errors.push('Resposta da API não é um objeto válido');
      return { valid: false, errors };
    }

    // Verificar se é um array (coleção de itens)
    if (Array.isArray(data)) {
      if (data.length === 0) {
        warnings.push('Array de inventário está vazio');
        return { valid: true, warnings, data };
      }

      // Validar estrutura de cada item
      data.forEach((item, index) => {
        const itemErrors = this.validateItem(item, index);
        errors.push(...itemErrors);
      });
    } else {
      // Se não for array, validar como um único item
      const itemErrors = this.validateItem(data, 0);
      errors.push(...itemErrors);
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      data
    };
  }

  /**
   * Valida um item individual do inventário
   */
  static validateItem(item, index) {
    const errors = [];

    if (!item || typeof item !== 'object') {
      errors.push(`Item ${index} não é um objeto válido`);
      return errors;
    }

    const requiredFields = ['nomeComponente', 'sigla', 'urlGit'];
    requiredFields.forEach((field) => {
      if (!item[field] || String(item[field]).trim() === '') {
        errors.push(`Item ${index} está sem o campo obrigatório: ${field}`);
      }
    });

    if (item.urlGit && !this.isValidUrl(item.urlGit)) {
      errors.push(`Item ${index} possui urlGit inválida: ${item.urlGit}`);
    }

    if (item.sigla && !/^[a-zA-Z0-9._-]+$/.test(item.sigla)) {
      errors.push(`Item ${index} possui sigla com formato inválido: ${item.sigla}`);
    }

    if (!item.tipoPlataformaAplicativo || typeof item.tipoPlataformaAplicativo !== 'object') {
      errors.push(`Item ${index} está sem tipoPlataformaAplicativo`);
    } else if (!item.tipoPlataformaAplicativo.nomeTipoPlataformaAplicativo || String(item.tipoPlataformaAplicativo.nomeTipoPlataformaAplicativo).trim() === '') {
      errors.push(`Item ${index} está sem nomeTipoPlataformaAplicativo`);
    }

    return errors;
  }

  /**
   * Converte a estrutura do inventário para o formato usado pelo fluxo de repositórios.
   */
  static normalizeInventoryToRepos(data) {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item) => ({
      'Nome do projeto': item.nomeComponente || '',
      Sigla: item.sigla || '',
      'Tipo de Plataforma': this.normalizePlatformType(item?.tipoPlataformaAplicativo?.nomeTipoPlataformaAplicativo),
      'url_repositório_github': item.urlGit || ''
    }));
  }

  static normalizePlatformType(value) {
    if (!value) {
      return '';
    }

    const normalized = String(value).trim().toLowerCase();
    if (normalized.includes('mobile')) {
      return 'Mobile';
    }

    if (normalized.includes('web')) {
      return 'Web';
    }

    return value;
  }

  static isValidUrl(value) {
    if (!value) {
      return false;
    }

    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }

  /**
   * Valida variáveis de ambiente necessárias
   */
  static validateEnvironment() {
    const errors = [];

    if (!process.env.INVENTARIO_API_URL) {
      errors.push('INVENTARIO_API_URL não definida no arquivo .env');
    }

    if (!process.env.INVENTARIO_API_TOKEN) {
      errors.push('INVENTARIO_API_TOKEN não definido no arquivo .env');
    }

    if (errors.length > 0) {
      Logger.error('Erro na configuração de variáveis de ambiente:');
      errors.forEach(error => Logger.error(`   - ${error}`));
      return { valid: false, errors };
    }

    return { valid: true };
  }

  /**
   * Valida HTTP response status
   */
  static validateStatus(status) {
    if (status < 200 || status >= 300) {
      return {
        valid: false,
        error: `HTTP ${status} - Requisição falhou`
      };
    }

    return { valid: true };
  }
}

module.exports = GetInventarioValidator;
