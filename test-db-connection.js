require('dotenv').config();
const { Client } = require('pg');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testConnection(name, connectionString, requiresSSL = true) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`Testing: ${name}`, 'cyan');
  log(`${'='.repeat(60)}`, 'cyan');
  log(`Connection String: ${connectionString.replace(/:[^:@]+@/, ':****@')}`, 'blue');
  
  const client = new Client({
    connectionString: connectionString,
    ssl: requiresSSL ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000, // 10 second timeout
  });

  try {
    log('\nAttempting to connect...', 'yellow');
    await client.connect();
    log('✓ Connection successful!', 'green');
    
    // Test query
    log('Running test query...', 'yellow');
    const result = await client.query('SELECT version(), current_database(), current_user, now()');
    log('✓ Query successful!', 'green');
    
    log('\nDatabase Information:', 'blue');
    log(`  PostgreSQL Version: ${result.rows[0].version.split(',')[0]}`, 'reset');
    log(`  Database Name: ${result.rows[0].current_database}`, 'reset');
    log(`  Current User: ${result.rows[0].current_user}`, 'reset');
    log(`  Server Time: ${result.rows[0].now}`, 'reset');
    
    await client.end();
    return { success: true, error: null };
  } catch (error) {
    log(`✗ Connection failed!`, 'red');
    log(`\nError Details:`, 'red');
    log(`  Code: ${error.code || 'N/A'}`, 'red');
    log(`  Message: ${error.message}`, 'red');
    
    if (error.code === 'ENOTFOUND') {
      log('\n  → Hostname not found. Check if the database server is running.', 'yellow');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      log('\n  → Cannot reach database server. Possible causes:', 'yellow');
      log('    - Database is paused (free tier Supabase databases auto-pause)', 'yellow');
      log('    - Firewall blocking connection', 'yellow');
      log('    - Incorrect host/port', 'yellow');
    } else if (error.code === '28P01') {
      log('\n  → Authentication failed. Check your username and password.', 'yellow');
    } else if (error.code === '3D000') {
      log('\n  → Database does not exist.', 'yellow');
    }
    
    await client.end().catch(() => {});
    return { success: false, error: error.message, code: error.code };
  }
}

async function main() {
  log('\n🔍 Database Connection Test Script', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const results = [];
  
  // Test 1: POSTGRES_URL_NON_POOLING (used by Prisma for migrations)
  if (process.env.POSTGRES_URL_NON_POOLING) {
    const result1 = await testConnection(
      'POSTGRES_URL_NON_POOLING (Direct - Used by Prisma Migrations)',
      process.env.POSTGRES_URL_NON_POOLING,
      true
    );
    results.push({ name: 'POSTGRES_URL_NON_POOLING', ...result1 });
  } else {
    log('\n⚠️  POSTGRES_URL_NON_POOLING not found in .env', 'yellow');
  }
  
  // Test 2: DATABASE_URL
  if (process.env.DATABASE_URL) {
    // Remove quotes if present
    const dbUrl = process.env.DATABASE_URL.replace(/^["']|["']$/g, '');
    const result2 = await testConnection(
      'DATABASE_URL',
      dbUrl,
      true
    );
    results.push({ name: 'DATABASE_URL', ...result2 });
  } else {
    log('\n⚠️  DATABASE_URL not found in .env', 'yellow');
  }
  
  // Test 3: POSTGRES_PRISMA_URL (pooled connection)
  if (process.env.POSTGRES_PRISMA_URL) {
    const result3 = await testConnection(
      'POSTGRES_PRISMA_URL (Pooled - Used by Prisma Client)',
      process.env.POSTGRES_PRISMA_URL,
      true
    );
    results.push({ name: 'POSTGRES_PRISMA_URL', ...result3 });
  } else {
    log('\n⚠️  POSTGRES_PRISMA_URL not found in .env', 'yellow');
  }
  
  // Summary
  log(`\n${'='.repeat(60)}`, 'cyan');
  log('📊 Test Summary', 'cyan');
  log(`${'='.repeat(60)}`, 'cyan');
  
  results.forEach(result => {
    if (result.success) {
      log(`✓ ${result.name}: SUCCESS`, 'green');
    } else {
      log(`✗ ${result.name}: FAILED`, 'red');
      log(`  Error: ${result.error}`, 'red');
    }
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  log(`\nResults: ${successCount}/${totalCount} connections successful`, 
      successCount === totalCount ? 'green' : 'yellow');
  
  if (successCount === 0) {
    log('\n⚠️  All connections failed. Please check:', 'yellow');
    log('  1. Is your Supabase database paused? (Check Supabase Dashboard)', 'yellow');
    log('  2. Are your credentials correct?', 'yellow');
    log('  3. Is your network/firewall allowing the connection?', 'yellow');
  } else if (successCount < totalCount) {
    log('\n⚠️  Some connections failed. Check the error messages above.', 'yellow');
  } else {
    log('\n✓ All connections successful!', 'green');
  }
}

main().catch(error => {
  log(`\n✗ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});

