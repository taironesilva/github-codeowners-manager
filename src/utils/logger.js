const chalk = require('chalk');

class Logger {
  static info(message) {
    console.log(chalk.blue('ℹ️  ') + message);
  }

  static success(message) {
    console.log(chalk.green('✅ ') + message);
  }

  static warning(message) {
    console.log(chalk.yellow('⚠️  ') + message);
  }

  static error(message) {
    console.log(chalk.red('❌ ') + message);
  }

  static debug(message) {
    if (process.env.DEBUG) {
      console.log(chalk.gray('🔍 ') + message);
    }
  }

  static title(message) {
    console.log(chalk.cyan.bold('\n' + '='.repeat(50)));
    console.log(chalk.cyan.bold(message));
    console.log(chalk.cyan.bold('='.repeat(50)));
  }

  static section(message) {
    console.log(chalk.cyan('\n--- ' + message));
  }

  static result(message, isSuccess = true) {
    const icon = isSuccess ? '✅' : '❌';
    const color = isSuccess ? chalk.green : chalk.red;
    console.log(color(`   ${icon} ${message}`));
  }
}

module.exports = Logger;