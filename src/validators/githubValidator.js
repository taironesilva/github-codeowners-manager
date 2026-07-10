const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const Logger = require('../utils/logger');
const RetryManager = require('../utils/retry');

class GitHubValidator {
  static async validateCLI() {
    try {
      const { stdout } = await execPromise('gh --version');
      const version = stdout.split('\n')[0];
      Logger.success(`GitHub CLI encontrado: ${version}`);
      return { valid: true, version };
    } catch (error) {
      Logger.error('GitHub CLI não está instalado ou não está no PATH');
      Logger.error('   Instale em: https://cli.github.com/');
      return { valid: false, error: 'GitHub CLI não disponível' };
    }
  }

  static async validateAuth() {
    try {
      const { stdout } = await execPromise('gh api user --jq .login');
      const username = stdout.trim();
      Logger.success(`Autenticação GitHub bem-sucedida (Usuário: ${username})`);
      return { valid: true, username };
    } catch (error) {
      Logger.error('Falha na autenticação do GitHub');
      Logger.error('   Execute: gh auth login');
      if (error.stderr) {
        Logger.debug(`   Detalhes: ${error.stderr}`);
      }
      return { valid: false, error: 'Falha na autenticação' };
    }
  }

  static async validateTokenPermissions() {
    try {
      // Verificar permissões do token
      const { stdout } = await execPromise('gh api /user --jq .permissions');
      const permissions = JSON.parse(stdout);
      
      Logger.debug('Permissões do token:');
      Logger.debug(JSON.stringify(permissions, null, 2));

      // Permissões mínimas necessárias
      const requiredPermissions = {
        'contents': 'write',    // Para criar/atualizar arquivos
        'pull_requests': 'write', // Para criar PRs
        'metadata': 'read'      // Para ler informações do repo
      };

      const missingPermissions = [];
      const insufficientPermissions = [];

      for (const [perm, required] of Object.entries(requiredPermissions)) {
        const hasPermission = permissions[perm];
        
        if (!hasPermission) {
          missingPermissions.push(perm);
          continue;
        }

        // Verificar nível da permissão
        const permLevels = ['read', 'write', 'admin'];
        const hasRequiredLevel = permLevels.indexOf(hasPermission) >= permLevels.indexOf(required);
        
        if (!hasRequiredLevel) {
          insufficientPermissions.push(`${perm} (tem: ${hasPermission}, necessário: ${required})`);
        }
      }

      if (missingPermissions.length > 0) {
        Logger.warning(`Permissões faltando: ${missingPermissions.join(', ')}`);
      }

      if (insufficientPermissions.length > 0) {
        Logger.warning(`Permissões insuficientes: ${insufficientPermissions.join(', ')}`);
      }

      const valid = missingPermissions.length === 0 && insufficientPermissions.length === 0;
      
      if (valid) {
        Logger.success('Token possui todas as permissões necessárias');
      } else {
        Logger.error('Token não possui permissões suficientes');
        Logger.error('   Necessário: contents:write, pull_requests:write, metadata:read');
      }

      return { 
        valid, 
        permissions,
        missingPermissions,
        insufficientPermissions
      };
      
    } catch (error) {
      Logger.error('Erro ao verificar permissões do token:', error.message);
      return { valid: false, error: 'Erro ao verificar permissões' };
    }
  }

  static async validateRepositoryExists(repoName) {
    return RetryManager.withRetry(
      async () => {
        try {
          await execPromise(`gh api repos/${repoName} --jq .name`);
          return true;
        } catch (error) {
          if (error.stderr && error.stderr.includes('404')) {
            return false;
          }
          throw error;
        }
      },
      { MAX_RETRIES: 2, RETRY_DELAY: 1000 },
      `Verificando repositório ${repoName}`
    );
  }

  static validateGitHubURL(url) {
    const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-._]+$/;
    return githubRegex.test(url);
  }

  static extractRepoName(url) {
    return url.replace('https://github.com/', '');
  }
}

module.exports = GitHubValidator;