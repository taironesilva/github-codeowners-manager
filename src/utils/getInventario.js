const https = require('https');
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

      // Normalizar o conteúdo para o formato usado pelos repositórios
      const normalizedData = GetInventarioValidator.normalizeInventoryToRepos(data);

      // Salvar arquivo do inventário original
      const outputDir = path.resolve(process.cwd(), 'repositorios');
      const outputPath = path.join(outputDir, 'repos_inventario.json');
      await FileService.writeJSON(outputPath, data);

      // Salvar arquivo normalizado para o fluxo de repositórios
      const githubReposPath = path.join(outputDir, 'repos_github.json');
      await FileService.writeJSON(githubReposPath, normalizedData);

      Logger.success(`Arquivo de inventário salvo com sucesso em: ${outputPath}`);
      Logger.success(`Arquivo normalizado salvo com sucesso em: ${githubReposPath}`);
      return { original: data, normalized: normalizedData };

    } catch (error) {
      Logger.error(`Erro ao buscar e salvar inventário: ${error.message}`);
      throw error;
    }
  }

  /**
   * Faz uma requisição HTTPS GET com token de autenticação
   */
  static makeRequest(urlString, token) {
    return new Promise((resolve, reject) => {
      try {
        const url = new URL(urlString);
        if (url.protocol !== 'https:') {
          throw new Error('A URL deve usar o protocolo https://');
        }

        const options = {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'User-Agent': 'github-codeowners'
          },
          agent: new https.Agent({ rejectUnauthorized: false })
        };

        const request = https.get(urlString, options, (response) => {
          let responseData = '';

          response.on('data', (chunk) => {
            responseData += chunk;
          });

          response.on('end', () => {
            try {
              // Validar status HTTP
              const statusValidation = GetInventarioValidator.validateStatus(response.statusCode);
              if (!statusValidation.valid) {
                reject(new Error(statusValidation.error));
                return;
              }

              const jsonData = JSON.parse(responseData);
              resolve(jsonData);
            } catch (error) {
              reject(new Error(`Erro ao processar a resposta da API: ${error.message}`));
            }
          });
        });

        request.on('error', (error) => {
          reject(new Error(`Erro na requisição HTTP: ${error.message}`));
        });

        request.on('timeout', () => {
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

if (require.main === module) {
  GetInventario.fetchAndSave()
    .then(() => {
      Logger.success('Fluxo de inventário concluído com sucesso');
    })
    .catch((error) => {
      Logger.error(`Falha no fluxo de inventário: ${error.message}`);
      process.exit(1);
    });
}
