class Logger {
  static info(message) {
    console.log('ℹ️  ' + message);
  }

  static success(message) {
    console.log('✅ ' + message);
  }

  static warning(message) {
    console.log('⚠️  ' + message);
  }

  static error(message) {
    console.log('❌ ' + message);
  }

  static debug(message) {
    if (process.env.DEBUG) {
      console.log('🔍 ' + message);
    }
  }

  static title(message) {
    console.log('\n' + '='.repeat(50));
    console.log(message);
    console.log('='.repeat(50));
  }

  static section(message) {
    console.log('\n--- ' + message);
  }

  static result(message, isSuccess = true) {
    const icon = isSuccess ? '✅' : '❌';
    console.log(`   ${icon} ${message}`);
  }
}

module.exports = Logger;