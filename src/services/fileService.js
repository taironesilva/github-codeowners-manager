const fs = require('fs');
const path = require('path');
const Logger = require('../utils/logger');

class FileService {
  static async readJSON(filePath) {
    try {
      const absolutePath = path.resolve(filePath);
      Logger.debug(`Lendo arquivo: ${absolutePath}`);
      
      const data = fs.readFileSync(absolutePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Erro ao ler arquivo: ${error.message}`);
    }
  }

  static async writeJSON(filePath, data) {
    try {
      const absolutePath = path.resolve(filePath);
      fs.writeFileSync(absolutePath, JSON.stringify(data, null, 2), 'utf8');
      Logger.success(`Arquivo salvo: ${absolutePath}`);
    } catch (error) {
      throw new Error(`Erro ao escrever arquivo: ${error.message}`);
    }
  }

  static async createReport(results, outputPath = 'report.json') {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        success: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length,
        skipped: results.filter(r => r.status === 'skipped').length
      },
      results
    };

    await this.writeJSON(outputPath, report);
    return report;
  }
}

module.exports = FileService;