/**
 * Integration Test Script
 * Tests Odyssey connection and Gemini API to ensure everything is working.
 * 
 * Run with: npx tsx scripts/test-integration.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const ODYSSEY_API_KEY = process.env.NEXT_PUBLIC_ODYSSEY_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

console.log('\n🔍 ODYSSEY ARENA - INTEGRATION TEST\n');
console.log('='.repeat(50));

// Test 1: Environment Variables
console.log('\n📋 TEST 1: Environment Variables\n');

function checkEnvVar(name: string, value: string | undefined, prefix?: string): boolean {
  if (!value) {
    console.log(`  ❌ ${name}: NOT SET`);
    return false;
  }
  if (prefix && !value.startsWith(prefix)) {
    console.log(`  ⚠️  ${name}: Set but invalid format (should start with "${prefix}")`);
    return false;
  }
  console.log(`  ✅ ${name}: ${value.slice(0, 12)}...`);
  return true;
}

const odysseyKeyValid = checkEnvVar('NEXT_PUBLIC_ODYSSEY_API_KEY', ODYSSEY_API_KEY, 'ody_');
const geminiKeyValid = checkEnvVar('GEMINI_API_KEY', GEMINI_API_KEY, 'AIza');
console.log(`  ℹ️  GEMINI_MODEL: ${GEMINI_MODEL}`);

// Test 2: Gemini API
console.log('\n📋 TEST 2: Gemini API Connection\n');

async function testGeminiAPI(): Promise<boolean> {
  if (!geminiKeyValid) {
    console.log('  ⏭️  Skipping (no valid API key)');
    return false;
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    console.log('  → Sending test prompt to Gemini...');
    
    const result = await model.generateContent(
      'Respond with a single JSON object: {"status": "ok", "message": "Gemini is working"}'
    );
    const text = result.response.text();
    
    console.log(`  ✅ Gemini responded: ${text.slice(0, 100)}...`);
    return true;
  } catch (error: any) {
    console.log(`  ❌ Gemini API Error: ${error.message}`);
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('     → Your GEMINI_API_KEY appears to be invalid');
    }
    if (error.message.includes('404') || error.message.includes('not found')) {
      console.log(`     → Model "${GEMINI_MODEL}" may not exist. Try "gemini-1.5-flash" instead.`);
    }
    return false;
  }
}

// Test 3: Odyssey SDK Import
console.log('\n📋 TEST 3: Odyssey SDK\n');

async function testOdysseySDK(): Promise<boolean> {
  try {
    const { Odyssey } = await import('@odysseyml/odyssey');
    console.log('  ✅ Odyssey SDK imported successfully');
    
    // Odyssey requires browser WebRTC APIs; skip in Node environments
    if (typeof (globalThis as any).RTCPeerConnection === 'undefined') {
      console.log('  ⚠️  RTCPeerConnection not available (Node runtime)');
      console.log('     → Odyssey streaming must be tested in the browser (npm run dev)');
      return true;
    }

    if (!odysseyKeyValid) {
      console.log('  ⏭️  Skipping connection test (no valid API key)');
      return true; // SDK works, just no key
    }

    console.log('  → Creating Odyssey client...');
    const client = new Odyssey({ apiKey: ODYSSEY_API_KEY! });
    console.log('  ✅ Odyssey client created');

    console.log('  → Testing connection (this may take a few seconds)...');
    
    // Try to connect with a timeout
    const connectPromise = client.connect({
      onConnected: () => console.log('  ✅ onConnected callback fired'),
      onError: (err, fatal) => console.log(`  ⚠️  onError: ${err.message} (fatal: ${fatal})`),
      onStatusChange: (status, msg) => console.log(`  ℹ️  Status: ${status}${msg ? ` - ${msg}` : ''}`),
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout (15s)')), 15000)
    );

    try {
      const stream = await Promise.race([connectPromise, timeoutPromise]);
      console.log('  ✅ Odyssey connected successfully!');
      
      // Clean up
      client.disconnect();
      console.log('  ✅ Disconnected cleanly');
      return true;
    } catch (err: any) {
      console.log(`  ❌ Connection failed: ${err.message}`);
      
      if (err.message.includes('401') || err.message.includes('unauthorized') || err.message.includes('Invalid API')) {
        console.log('     → Your ODYSSEY_API_KEY appears to be invalid or expired');
        console.log('     → Get a new key at: https://developer.odyssey.ml/dashboard');
      }
      if (err.message.includes('timeout')) {
        console.log('     → Connection timed out. This could be a network issue.');
      }
      
      try { client.disconnect(); } catch {}
      return false;
    }
  } catch (error: any) {
    console.log(`  ❌ Odyssey SDK Error: ${error.message}`);
    return false;
  }
}

// Test 4: Local Gemini API Route (if server running)
async function testLocalGeminiRoute(): Promise<boolean> {
  console.log('\n📋 TEST 4: Local Gemini API Route\n');
  
  // Try both ports (3000 and 3002)
  const ports = [3000, 3002];
  
  for (const port of ports) {
    try {
      console.log(`  → Testing http://localhost:${port}/api/gemini...`);
      
      const response = await fetch(`http://localhost:${port}/api/gemini`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`  ✅ Local API responded on port ${port}:`, data);
        
        // Also test POST
        console.log('  → Testing POST with action...');
        const postResponse = await fetch(`http://localhost:${port}/api/gemini`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'strikes with a powerful sword slash',
            context: {
              players: [
                { id: 1, name: 'Player 1', character: 'A fierce warrior', stats: { momentum: 50, power: 50, defense: 50, energy: 100 } },
                { id: 2, name: 'Player 2', character: 'A dark mage', stats: { momentum: 50, power: 50, defense: 50, energy: 100 } },
              ],
              activePlayer: 1,
            },
          }),
        });
        
        if (postResponse.ok) {
          const postData = await postResponse.json();
          console.log('  ✅ POST response:', JSON.stringify(postData, null, 2).slice(0, 300) + '...');
          return true;
        } else {
          const errorData = await postResponse.text();
          console.log(`  ⚠️  POST returned ${postResponse.status}: ${errorData.slice(0, 200)}`);
        }
        
        return true;
      }
    } catch (err: any) {
      if (err.cause?.code === 'ECONNREFUSED') {
        console.log(`  ⏭️  Port ${port} not available`);
      } else {
        console.log(`  ⚠️  Port ${port} error: ${err.message}`);
      }
    }
  }
  
  console.log('  ⚠️  No local server found. Start with: npm run dev');
  return false;
}

// Run all tests
async function runTests() {
  const geminiResult = await testGeminiAPI();
  const odysseyResult = await testOdysseySDK();
  const localResult = await testLocalGeminiRoute();
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 TEST SUMMARY\n');
  console.log(`  Environment Variables: ${odysseyKeyValid && geminiKeyValid ? '✅' : '❌'}`);
  console.log(`  Gemini API Direct:     ${geminiResult ? '✅' : '❌'}`);
  console.log(`  Odyssey SDK:           ${odysseyResult ? '✅' : '❌'}`);
  console.log(`  Local API Route:       ${localResult ? '✅' : '⚠️ (server may not be running)'}`);
  
  const allPassed = odysseyKeyValid && geminiKeyValid && geminiResult && odysseyResult;
  
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('\n🎉 All core systems working! You can proceed with development.\n');
  } else {
    console.log('\n⚠️  Some issues detected. See above for details.\n');
  }
}

runTests().catch(console.error);
