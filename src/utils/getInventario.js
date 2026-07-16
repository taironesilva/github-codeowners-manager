const https = require('https');
const http = require('http');
const path = require('path');
require('dotenv').config();

const FileService = require('../services/fileService');
const Logger = require('./logger');
const GetInventarioValidator = require('../validators/getInventarioValidator');

class GetInventario {
  /**
   * Faz uma requisição GET para a API de inventário e salva a resposta
   */
  static async fetchAndSave() {
    try {
      // Validar variáveis de ambiente
      const envValidation = GetInventarioValidator.validateEnvironment();
      if (!envValidation.valid) {
        Logger.error('Falha na validação de variáveis de ambiente');
        throw new Error('Variáveis de ambiente ausentes');
      }

      const apiUrl = process.env.INVENTARIO_API_URL;
      const apiToken = process.env.INVENTARIO_API_TOKEN;

      Logger.success(`Iniciando requisição para: ${apiUrl}`);

      // Fazer a requisição GET
      const data = await this.makeRequest(apiUrl, apiToken);

      // Validar resposta
      const validation = GetInventarioValidator.validateResponse(data);
      if (!validation.valid) {
        Logger.error('Resposta da API não passou na validação');
        throw new Error(`Validação falhou: ${validation.errors?.join(', ')}`);
      }

      if (validation.warnings) {
        validation.warnings.forEach(warn => Logger.warning(warn));
      }

      // Salvar arquivo
      const outputPath = path.resolve(process.cwd(), 'repositorios', 'getInventario.json');
      await FileService.writeJSON(outputPath, data);

      Logger.success(`Arquivo de inventário salvo com sucesso em: ${outputPath}`);
      return data;

    } catch (error) {
      Logger.error(`Erro ao buscar e salvar inventário: ${error.message}`);
      throw error;
    }
  }

  /**
   * Faz uma requisição HTTP GET com token de autenticação
   */
  static makeRequest(urlString, token) {
    return new Promise((resolve, reject) => {
      try {
        const url = new URL(urlString);
        const isHttps = url.protocol === 'https:';
        const client = isHttps ? https : http;

        const options = {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'User-Agent': 'github-codeowners-manager/1.0.0'
          }
        };

        const request = client.get(urlString, options, (response) => {
          let responseData = '';

          // Validar status HTTP
          const statusValidation = GetInventarioValidator.validateStatus(response.statusCode);
          if (!statusValidation.valid) {
            reject(new Error(statusValidation.error));
            return;
          }

          // Coletar dados da resposta
          response.on('data', (chunk) => {
            responseData += chunk;
          });

          // Processar resposta completa
          response.on('end', () => {
            try {
              const jsonData = JSON.parse(responseData);
              resolve(jsonData);
            } catch (error) {
              reject(new Error(`Erro ao fazer parse da resposta JSON: ${error.message}`));
            }
          });
        });

        // Tratar erros de conexão
        request.on('error', (error) => {
          reject(new Error(`Erro na requisição HTTP: ${error.message}`));
        });

        // Timeout
        request.setTimeout(process.env.TIMEOUT || 30000, () => {
          request.destroy();
          reject(new Error('Timeout na requisição HTTP'));
        });

      } catch (error) {
        reject(new Error(`Erro ao preparar requisição: ${error.message}`));
      }
    });
  }
}

module.exports = GetInventario;
