const fs = require('fs');
const Logger = require('../utils/logger');

class JSONValidator {
  static validateFile(filePath) {
    // 1. Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      Logger.error(`Arquivo JSON não encontrado: ${filePath}`);
      return { valid: false, error: 'Arquivo não encontrado' };
    }

    try {
      // 2. Ler o arquivo
      const data = fs.readFileSync(filePath, 'utf8');
      
      // 3. Validar JSON
      const jsonData = JSON.parse(data);
      
      // 4. Validar estrutura
      return this.validateStructure(jsonData);
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        Logger.error('Arquivo JSON inválido - erro de sintaxe');
        Logger.error(`   ${error.message}`);
        return { valid: false, error: 'JSON inválido', details: error.message };
      }
      
      Logger.error('Erro ao ler arquivo JSON:', error.message);
      return { valid: false, error: 'Erro ao ler arquivo', details: error.message };
    }
  }

  static validateStructure(data) {
    // Verificar se é um array
    if (!Array.isArray(data)) {
      Logger.error('O arquivo JSON não contém um array de repositórios');
      return { valid: false, error: 'Estrutura inválida - deve ser um array' };
    }

    if (data.length === 0) {
      Logger.warning('O arquivo JSON está vazio (array sem elementos)');
      return { valid: true, data, warnings: ['Array vazio'] };
    }

    // Campos obrigatórios
    const requiredFields = [
      'Nome do projeto',
      'Sigla',
      'Tipo de Plataforma',
      'url_repositório_github'
    ];

    // Validar cada repositório
    const invalidRepos = [];
    const duplicates = this.findDuplicates(data, 'Nome do projeto');

    data.forEach((repo, index) => {
      const missingFields = requiredFields.filter(field => !repo[field]);
      if (missingFields.length > 0) {
        invalidRepos.push({
          index,
          name: repo['Nome do projeto'] || `Repositório ${index + 1}`,
          missingFields
        });
      }
    });

    if (invalidRepos.length > 0) {
      Logger.warning(`${invalidRepos.length} repositório(s) com estrutura inválida`);
      invalidRepos.forEach(repo => {
        Logger.warning(`   ${repo.name}: campos faltando - ${repo.missingFields.join(', ')}`);
      });
    }

    if (duplicates.length > 0) {
      Logger.warning(`Encontrados nomes duplicados: ${duplicates.join(', ')}`);
    }

    return {
      valid: invalidRepos.length === 0,
      data,
      warnings: [
        ...(invalidRepos.length > 0 ? [`${invalidRepos.length} repositórios com estrutura inválida`] : []),
        ...(duplicates.length > 0 ? [`Nomes duplicados encontrados: ${duplicates.join(', ')}`] : [])
      ],
      invalidRepos,
      duplicates
    };
  }

  static findDuplicates(data, field) {
    const seen = new Set();
    const duplicates = new Set();
    
    data.forEach(item => {
      const value = item[field];
      if (seen.has(value)) {
        duplicates.add(value);
      }
      seen.add(value);
    });
    
    return Array.from(duplicates);
  }
}

module.exports = JSONValidator;