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

    // Validar campos esperados (adicione conforme necessário)
    // Exemplos de campos que você pode esperar:
    // - nomeComponente
    // - sigla
    // - urlGit
    // etc

    return errors;
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
