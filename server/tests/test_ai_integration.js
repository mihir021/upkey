/**
 * Phase 6 Integration Test
 * Tests the Node.js → Python ML service pipeline via POST /api/ai/chat.
 *
 * Prerequisites:
 *   - Python ML service running on :8000
 *   - Node backend running on :5000
 *   - MongoDB running (for auth)
 */

const NODE_URL = 'http://localhost:5000';

// ---------- helpers ----------
async function post(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${NODE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data };
}

function section(n, title) {
  console.log(`\n${'='.repeat(72)}`);
  console.log(`  ${n}. ${title}`);
  console.log('='.repeat(72));
}

function showResult(result) {
  console.log(`  HTTP Status: ${result.status}`);
  console.log(`  Success:     ${result.data.success}`);
  if (result.data.data) {
    const d = result.data.data;
    console.log(`  LLM Powered: ${d.llm_powered}`);
    console.log(`  Intent:       ${d.intent}`);
    console.log(`  Tools Used:   ${JSON.stringify(d.tools_used)}`);
    const msg = d.message || '';
    console.log(`  Message:      ${msg.length > 300 ? msg.slice(0, 300) + '...' : msg}`);
  } else {
    console.log(`  Message:      ${result.data.message}`);
  }
}

// ---------- main ----------
(async () => {
  try {
    // Step 0: Get a JWT token by signing up a test user
    section(0, 'AUTH: Create test user and get JWT token');
    const email = `testai_${Date.now()}@joyory.com`;
    const signupResult = await post('/api/auth/signup', {
      name: 'AI Test User',
      email,
      password: 'TestPass123!',
    });
    if (signupResult.status === 201) {
      console.log('  Signup OK');
    } else if (signupResult.status === 409) {
      console.log('  User already exists, logging in...');
    } else {
      console.log(`  Unexpected signup status: ${signupResult.status}`);
      console.log(`  ${JSON.stringify(signupResult.data)}`);
    }

    // Login to get token
    const loginResult = await post('/api/auth/login', {
      email,
      password: 'TestPass123!',
    });
    const token = loginResult.data.token;
    if (!token) {
      console.error('  FAILED: Could not get JWT token');
      console.log(JSON.stringify(loginResult.data));
      process.exit(1);
    }
    console.log('  JWT token obtained');

    // ---------------------------------------------------------------
    // Test 1: No auth — should be 401
    // ---------------------------------------------------------------
    section(1, 'NO AUTH: POST /api/ai/chat without token');
    const noAuthResult = await post('/api/ai/chat', {
      message: 'Hello',
    });
    console.log(`  HTTP Status: ${noAuthResult.status}`);
    console.log(`  Message:     ${noAuthResult.data.message}`);
    if (noAuthResult.status === 401) {
      console.log('  PASS — correctly rejected unauthenticated request');
    } else {
      console.log('  FAIL — should have returned 401');
    }

    // ---------------------------------------------------------------
    // Test 2: Missing message — should be 400
    // ---------------------------------------------------------------
    section(2, 'VALIDATION: POST /api/ai/chat with empty message');
    const emptyResult = await post('/api/ai/chat', { message: '' }, token);
    console.log(`  HTTP Status: ${emptyResult.status}`);
    console.log(`  Message:     ${emptyResult.data.message}`);
    if (emptyResult.status === 400) {
      console.log('  PASS — correctly rejected empty message');
    } else {
      console.log('  FAIL — should have returned 400');
    }

    // ---------------------------------------------------------------
    // Test 3: Recommendation (full pipeline)
    // ---------------------------------------------------------------
    section(3, 'RECOMMENDATION: oily skin + acne under 1000');
    const recResult = await post('/api/ai/chat', {
      message: 'I have oily skin and acne. Recommend something under 1000.',
      user_profile: {
        skin_type: 'Oily',
        skin_tone: 'Medium',
        concerns: ['Acne'],
        budget: 1000,
      },
      product_id: null,
      conversation_history: [],
    }, token);
    showResult(recResult);
    if (recResult.status === 200 && recResult.data.success && recResult.data.data.tools_used.length > 0) {
      console.log('  PASS — full pipeline working');
    } else {
      console.log('  FAIL');
    }

    // Add delay to respect rate limits
    await new Promise(r => setTimeout(r, 12000));

    // ---------------------------------------------------------------
    // Test 4: Product search
    // ---------------------------------------------------------------
    section(4, 'SEARCH: niacinamide products under 800');
    const searchResult = await post('/api/ai/chat', {
      message: 'Show me niacinamide products under 800.',
    }, token);
    showResult(searchResult);
    if (searchResult.status === 200 && searchResult.data.success) {
      console.log('  PASS');
    } else {
      console.log('  FAIL');
    }

    await new Promise(r => setTimeout(r, 12000));

    // ---------------------------------------------------------------
    // Test 5: Product comparison
    // ---------------------------------------------------------------
    section(5, 'COMPARE: P011 vs P003');
    const compareResult = await post('/api/ai/chat', {
      message: 'Compare P011 and P003',
    }, token);
    showResult(compareResult);
    if (compareResult.status === 200 && compareResult.data.success) {
      console.log('  PASS');
    } else {
      console.log('  FAIL');
    }

    await new Promise(r => setTimeout(r, 12000));

    // ---------------------------------------------------------------
    // Test 6: Dupe search
    // ---------------------------------------------------------------
    section(6, 'DUPE: cheaper alternative to P013');
    const dupeResult = await post('/api/ai/chat', {
      message: 'Find a cheaper alternative to P013',
    }, token);
    showResult(dupeResult);
    if (dupeResult.status === 200 && dupeResult.data.success) {
      console.log('  PASS');
    } else {
      console.log('  FAIL');
    }

    await new Promise(r => setTimeout(r, 12000));

    // ---------------------------------------------------------------
    // Test 7: Routine
    // ---------------------------------------------------------------
    section(7, 'ROUTINE: acne routine under 2000');
    const routineResult = await post('/api/ai/chat', {
      message: 'Build me a skincare routine for acne under 2000',
      user_profile: { skin_type: 'Oily', concerns: ['Acne'], budget: 2000 },
    }, token);
    showResult(routineResult);
    if (routineResult.status === 200 && routineResult.data.success) {
      console.log('  PASS');
    } else {
      console.log('  FAIL');
    }

    // ---------------------------------------------------------------
    // Summary
    // ---------------------------------------------------------------
    console.log(`\n${'='.repeat(72)}`);
    console.log('  ALL PHASE 6 INTEGRATION TESTS COMPLETE');
    console.log('='.repeat(72));

  } catch (err) {
    console.error('Test script error:', err);
    process.exit(1);
  }
})();
