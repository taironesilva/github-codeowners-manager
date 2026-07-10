const Logger = require('./logger');

class RetryManager {
  constructor(config) {
    this.maxRetries = config.MAX_RETRIES || 3;
    this.retryDelay = config.RETRY_DELAY || 2000;
    this.timeout = config.TIMEOUT || 30000;
  }

  async execute(operation, context = 'Operação') {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        Logger.debug(`Tentativa ${attempt}/${this.maxRetries} - ${context}`);
        
        // Criar promise com timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout excedido')), this.timeout);
        });

        const result = await Promise.race([operation(), timeoutPromise]);
        return result;
        
      } catch (error) {
        lastError = error;
        Logger.warning(`Tentativa ${attempt}/${this.maxRetries} falhou: ${error.message}`);
        
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * attempt;
          Logger.debug(`Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`Falha após ${this.maxRetries} tentativas: ${lastError.message}`);
  }

  static async withRetry(operation, config, context) {
    const retryManager = new RetryManager(config);
    return retryManager.execute(operation, context);
  }
}

module.exports = RetryManager;