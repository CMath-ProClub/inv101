// run_migration_in_memory.js
// Starts an in-memory MongoDB, runs migrate-articles-to-atlas.js against it, then stops the server.
const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log('🧪 Started in-memory MongoDB at', uri);

  const scriptPath = path.join(__dirname, '..', 'migrate-articles-to-atlas.js');

  const env = Object.assign({}, process.env, {
    MONGODB_URI: uri,
    MIGRATION_FILE: process.env.MIGRATION_FILE || 'SPY_daily.json',
    MIGRATION_SYMBOL: process.env.MIGRATION_SYMBOL || 'SPY'
  });

  const child = spawn(process.execPath, [scriptPath], { env, stdio: 'inherit' });

  child.on('exit', async (code, signal) => {
    console.log(`migration process exited with code=${code} signal=${signal}`);
    try { await mongod.stop(); console.log('🧪 In-memory MongoDB stopped'); } catch (e) { console.warn('Failed to stop mongod:', e); }
    process.exit(code === null ? 0 : code);
  });

  child.on('error', async (err) => {
    console.error('Failed to start migration child process:', err);
    try { await mongod.stop(); } catch (e) {}
    process.exit(1);
  });
})();
