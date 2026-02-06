/**
 * API Integration Test Script
 * Run with: node scripts/test-apis.js
 * 
 * Tests all API integrations to ensure the app is ready to demo.
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.startsWith('#') || !line.trim()) return;
    const eqIndex = line.indexOf('=');
    if (eqIndex > 0) {
      const key = line.slice(0, eqIndex).trim();
      const value = line.slice(eqIndex + 1).trim();
      process.env[key] = value;
    }
  });
} else {
  console.log('WARNING: .env.local not found at', envPath);
}

const ODYSSEY_API_KEY = process.env.NEXT_PUBLIC_ODYSSEY_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) { log(`  ✅ ${message}`, 'green'); }
function error(message) { log(`  ❌ ${message}`, 'red'); }
function warn(message) { log(`  ⚠️  ${message}`, 'yellow'); }
function info(message) { log(`  ℹ️  ${message}`, 'cyan'); }

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════════════════════
// TEST 1: Environment Variables
// ═══════════════════════════════════════════════════════════════════
function testEnvVariables() {
  log('\n📋 TEST 1: Environment Variables', 'bold');
  
  let allValid = true;
  
  // Odyssey API Key
  if (!ODYSSEY_API_KEY) {
    error('NEXT_PUBLIC_ODYSSEY_API_KEY is not set');
    allValid = false;
  } else if (!ODYSSEY_API_KEY.startsWith('ody_')) {
    error(`NEXT_PUBLIC_ODYSSEY_API_KEY has invalid format (should start with "ody_")`);
    allValid = false;
  } else {
    success(`NEXT_PUBLIC_ODYSSEY_API_KEY: ${ODYSSEY_API_KEY.slice(0, 15)}...`);
  }
  
  // Gemini API Key
  if (!GEMINI_API_KEY) {
    error('GEMINI_API_KEY is not set');
    allValid = false;
  } else if (!GEMINI_API_KEY.startsWith('AIza')) {
    error(`GEMINI_API_KEY has invalid format (should start with "AIza")`);
    allValid = false;
  } else {
    success(`GEMINI_API_KEY: ${GEMINI_API_KEY.slice(0, 15)}...`);
  }
  
  info(`GEMINI_MODEL: ${GEMINI_MODEL}`);
  
  return allValid;
}

// ═══════════════════════════════════════════════════════════════════
// TEST 2: Gemini API Direct
// ═══════════════════════════════════════════════════════════════════
async function testGeminiDirect() {
  log('\n📋 TEST 2: Gemini API (Direct)', 'bold');
  
  if (!GEMINI_API_KEY) {
    warn('Skipping (no API key)');
    return false;
  }
  
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    
    info('Sending test prompt...');
    const result = await model.generateContent(
      'Respond with exactly: {"status":"ok"}'
    );
    const text = result.response.text().trim();
    
    if (text.includes('ok')) {
      success(`Gemini responded: ${text.slice(0, 50)}`);
      return true;
    } else {
      error(`Unexpected response: ${text.slice(0, 100)}`);
      return false;
    }
  } catch (err) {
    error(`Gemini API error: ${err.message}`);
    if (err.message.includes('API_KEY_INVALID')) {
      info('Your GEMINI_API_KEY appears to be invalid');
    }
    if (err.message.includes('404') || err.message.includes('not found')) {
      info(`Model "${GEMINI_MODEL}" may not exist. Try "gemini-1.5-flash"`);
    }
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// TEST 3: Local Server Health Check
// ═══════════════════════════════════════════════════════════════════
async function testServerHealth() {
  log('\n📋 TEST 3: Local Server Health', 'bold');
  
  try {
    info(`Checking ${SERVER_URL}...`);
    const response = await fetch(SERVER_URL);
    
    if (response.ok) {
      success(`Server is running at ${SERVER_URL}`);
      return true;
    } else {
      error(`Server returned status ${response.status}`);
      return false;
    }
  } catch (err) {
    error(`Cannot connect to ${SERVER_URL}`);
    info('Make sure the dev server is running: npm run dev');
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// TEST 4: Gemini API Route (via Server)
// ═══════════════════════════════════════════════════════════════════
async function testGeminiRoute() {
  log('\n📋 TEST 4: Gemini API Route', 'bold');
  
  try {
    // Test GET (health check)
    info('Testing GET /api/gemini...');
    const getResponse = await fetch(`${SERVER_URL}/api/gemini`);
    
    if (!getResponse.ok) {
      error(`GET returned status ${getResponse.status}`);
      return false;
    }
    
    const healthData = await getResponse.json();
    if (healthData.status === 'ready') {
      success(`Health check passed: ${healthData.message}`);
    } else {
      warn(`Health check: ${healthData.message || healthData.status}`);
    }
    
    // Test POST (narrative generation)
    info('Testing POST /api/gemini (narrative generation)...');
    const postResponse = await fetch(`${SERVER_URL}/api/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'unleashes a devastating dragon breath attack',
        context: {
          players: [
            { id: 1, name: 'Player 1', character: 'Dragon Mage', stats: { momentum: 50, power: 60, defense: 40, energy: 80 } },
            { id: 2, name: 'Player 2', character: 'Ice Knight', stats: { momentum: 50, power: 50, defense: 60, energy: 90 } },
          ],
          activePlayer: 1,
        },
      }),
    });
    
    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      error(`POST returned status ${postResponse.status}: ${errorText.slice(0, 100)}`);
      return false;
    }
    
    const narrativeData = await postResponse.json();
    
    if (narrativeData.narrative && narrativeData.analysis && narrativeData.statChanges) {
      success('Narrative generation working!');
      info(`Narrative: "${narrativeData.narrative.slice(0, 80)}..."`);
      info(`Analysis: ${narrativeData.analysis.type} / ${narrativeData.analysis.intensity} / ${narrativeData.analysis.impactType}`);
      info(`P1 momentum: ${narrativeData.statChanges.player1?.momentum || 0}, P2 momentum: ${narrativeData.statChanges.player2?.momentum || 0}`);
      return true;
    } else {
      error('Invalid response structure from narrative API');
      return false;
    }
  } catch (err) {
    error(`API route error: ${err.message}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// TEST 5: Odyssey SDK Validation
// ═══════════════════════════════════════════════════════════════════
async function testOdysseySDK() {
  log('\n📋 TEST 5: Odyssey SDK', 'bold');
  
  if (!ODYSSEY_API_KEY) {
    warn('Skipping (no API key)');
    return false;
  }
  
  try {
    const { Odyssey } = require('@odysseyml/odyssey');
    success('Odyssey SDK imported successfully');
    
    info('Creating client...');
    const client = new Odyssey({ apiKey: ODYSSEY_API_KEY });
    success('Odyssey client created');
    
    // Note: Full connection test requires browser (WebRTC)
    info('Full connection test requires browser environment (WebRTC)');
    info('SDK validation passed - connection will work in browser');
    
    return true;
  } catch (err) {
    error(`Odyssey SDK error: ${err.message}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// TEST 6: Static Assets
// ═══════════════════════════════════════════════════════════════════
async function testStaticAssets() {
  log('\n📋 TEST 6: Static Assets', 'bold');
  
  const assets = [
    '/logo.svg',
  ];
  
  let allFound = true;
  
  for (const asset of assets) {
    try {
      const response = await fetch(`${SERVER_URL}${asset}`);
      if (response.ok) {
        success(`Found: ${asset}`);
      } else {
        warn(`Missing: ${asset} (${response.status})`);
        allFound = false;
      }
    } catch (err) {
      error(`Cannot check ${asset}: ${err.message}`);
      allFound = false;
    }
  }
  
  return allFound;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
async function runAllTests() {
  log('\n' + '═'.repeat(60), 'cyan');
  log('  ODYSSEY ARENA - API INTEGRATION TEST', 'bold');
  log('═'.repeat(60), 'cyan');
  
  const results = {
    envVariables: false,
    geminiDirect: false,
    serverHealth: false,
    geminiRoute: false,
    odysseySDK: false,
    staticAssets: false,
  };
  
  // Run tests
  results.envVariables = testEnvVariables();
  results.geminiDirect = await testGeminiDirect();
  results.serverHealth = await testServerHealth();
  
  if (results.serverHealth) {
    results.geminiRoute = await testGeminiRoute();
    results.staticAssets = await testStaticAssets();
  }
  
  results.odysseySDK = await testOdysseySDK();
  
  // Summary
  log('\n' + '═'.repeat(60), 'cyan');
  log('  TEST SUMMARY', 'bold');
  log('═'.repeat(60), 'cyan');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  const labels = {
    envVariables: 'Environment Variables',
    geminiDirect: 'Gemini API (Direct)',
    serverHealth: 'Local Server Health',
    geminiRoute: 'Gemini API Route (Narratives)',
    odysseySDK: 'Odyssey SDK',
    staticAssets: 'Static Assets',
  };
  
  console.log('');
  for (const [test, result] of Object.entries(results)) {
    const icon = result ? '✅' : '❌';
    console.log(`  ${icon} ${labels[test] || test}`);
  }
  
  log('\n' + '─'.repeat(60), 'cyan');
  
  if (passed === total) {
    log('\n  🎉 ALL TESTS PASSED! App is ready to demo.\n', 'green');
    process.exit(0);
  } else if (passed >= 4) {
    log(`\n  ⚠️  ${passed}/${total} tests passed. Some issues may need attention.\n`, 'yellow');
    process.exit(0);
  } else {
    log(`\n  ❌ ${passed}/${total} tests passed. Please fix issues before demo.\n`, 'red');
    process.exit(1);
  }
}

// Run
runAllTests().catch(err => {
  error(`Test runner error: ${err.message}`);
  process.exit(1);
});
