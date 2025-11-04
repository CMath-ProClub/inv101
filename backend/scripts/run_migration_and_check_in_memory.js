// run_migration_and_check_in_memory.js
// Starts an in-memory MongoDB, runs migrate-articles-to-atlas.js, then runs scripts/check_stockprices.js
// to validate the inserted documents.
const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');
const path = require('path');

function runNodeScript(scriptPath, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath], { env, stdio: 'inherit' });
    child.on('exit', (code, signal) => {
      if (code === 0) resolve(code); else reject(new Error(`Script ${scriptPath} exited with code ${code}`));
    });
    child.on('error', err => reject(err));
  });
}

(async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log('🧪 Started in-memory MongoDB at', uri);

  const env = Object.assign({}, process.env, {
    MONGODB_URI: uri,
    MIGRATION_FILE: process.env.MIGRATION_FILE || 'SPY_daily.json',
    MIGRATION_SYMBOL: process.env.MIGRATION_SYMBOL || 'SPY'
  });

  try {
    // Run migration
    console.log('➡️ Running migration against in-memory DB...');
    await runNodeScript(path.join(__dirname, '..', 'migrate-articles-to-atlas.js'), env);

    // Run check script
    console.log('➡️ Running check_stockprices script to validate results...');
    await runNodeScript(path.join(__dirname, 'check_stockprices.js'), env);

    console.log('✅ Migration + check completed successfully');
  } catch (e) {
    console.error('Integration test failed:', e);
    process.exitCode = 1;
  } finally {
    try { await mongod.stop(); console.log('🧪 In-memory MongoDB stopped'); } catch (e) { console.warn('Failed to stop mongod:', e); }
  }
})();
