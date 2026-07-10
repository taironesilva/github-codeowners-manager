const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const Logger = require('../utils/logger');
const RetryManager = require('../utils/retry');

class GitHubService {
  constructor(config) {
    this.config = config;
    process.env.GITHUB_TOKEN = config.GITHUB.TOKEN;
  }

  async checkCodeowners(repoName) {
    return RetryManager.withRetry(
      async () => {
        try {
          const command = `gh api repos/${repoName}/contents/${this.config.FILE.CODEOWNERS_PATH} --jq '.content'`;
          const { stdout } = await execPromise(command, { timeout: this.config.GITHUB.TIMEOUT });
          
          // Decodificar base64
          const content = Buffer.from(stdout.trim(), 'base64').toString('utf-8');
          
          return {
            exists: true,
            content
          };
        } catch (error) {
          if (error.stderr && error.stderr.includes('404')) {
            return { exists: false, content: null };
          }
          throw error;
        }
      },
      this.config.GITHUB,
      `Verificando CODEOWNERS em ${repoName}`
    );
  }

  async createCodeownersPR(repoName) {
    const content = this.config.FILE.CODEOWNERS_CONTENT;

    try {
      // 1. Obter SHA da branch main
      const { stdout: shaStdout } = await execPromise(
        `gh api repos/${repoName}/git/refs/heads/main --jq '.object.sha'`,
        { timeout: this.config.GITHUB.TIMEOUT }
      );
      const sha = shaStdout.trim();

      // 2. Criar nova branch
      await execPromise(
        `gh api repos/${repoName}/git/refs -X POST -f ref=refs/heads/${this.config.PR.BRANCH_NAME} -f sha=${sha}`,
        { timeout: this.config.GITHUB.TIMEOUT }
      );

      // 3. Criar arquivo CODEOWNERS
      const contentBase64 = Buffer.from(content).toString('base64');
      await execPromise(
        `gh api repos/${repoName}/contents/${this.config.FILE.CODEOWNERS_PATH} -X PUT -f message="${this.config.PR.COMMIT_MESSAGE}" -f content="${contentBase64}" -f branch="${this.config.PR.BRANCH_NAME}"`,
        { timeout: this.config.GITHUB.TIMEOUT }
      );

      // 4. Criar PR
      const { stdout } = await execPromise(
        `gh api repos/${repoName}/pulls -X POST -f title="${this.config.PR.TITLE}" -f body="${this.config.PR.BODY}" -f head="${this.config.PR.BRANCH_NAME}" -f base=main --jq '.html_url'`,
        { timeout: this.config.GITHUB.TIMEOUT }
      );
      
      return stdout.trim();
      
    } catch (error) {
      Logger.error(`Erro detalhado ao criar CODEOWNERS em ${repoName}:`);
      Logger.error(`   ${error.message}`);
      if (error.stderr) {
        Logger.debug(`   stderr: ${error.stderr}`);
      }
      throw error;
    }
  }

  async getDefaultBranch(repoName) {
    try {
      const { stdout } = await execPromise(
        `gh api repos/${repoName} --jq '.default_branch'`,
        { timeout: this.config.GITHUB.TIMEOUT }
      );
      return stdout.trim();
    } catch (error) {
      Logger.warning(`Não foi possível obter branch padrão para ${repoName}, usando 'main'`);
      return 'main';
    }
  }
}

module.exports = GitHubService;