// Simple test script for String Analyzer API
// Run with: node test.js
// Make sure your server is running first!

const API_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing String Analyzer API...\n');

  try {
    // Test 1: Create a string
    console.log('Test 1: POST /strings (Create palindrome)');
    const createResponse = await fetch(`${API_URL}/strings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 'racecar' })
    });
    const createData = await createResponse.json();
    console.log('Status:', createResponse.status);
    console.log('Response:', JSON.stringify(createData, null, 2));
    console.log('✅ Pass\n');

    // Test 2: Create another string
    console.log('Test 2: POST /strings (Create non-palindrome)');
    const create2Response = await fetch(`${API_URL}/strings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 'hello world' })
    });
    const create2Data = await create2Response.json();
    console.log('Status:', create2Response.status);
    console.log('Response:', JSON.stringify(create2Data, null, 2));
    console.log('✅ Pass\n');

    // Test 3: Try to create duplicate (should fail with 409)
    console.log('Test 3: POST /strings (Duplicate - should return 409)');
    const duplicateResponse = await fetch(`${API_URL}/strings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 'racecar' })
    });
    const duplicateData = await duplicateResponse.json();
    console.log('Status:', duplicateResponse.status);
    console.log('Response:', JSON.stringify(duplicateData, null, 2));
    console.log(duplicateResponse.status === 409 ? '✅ Pass\n' : '❌ Fail\n');

    // Test 4: Get specific string
    console.log('Test 4: GET /strings/:string_value');
    const getResponse = await fetch(`${API_URL}/strings/racecar`);
    const getData = await getResponse.json();
    console.log('Status:', getResponse.status);
    console.log('Response:', JSON.stringify(getData, null, 2));
    console.log('✅ Pass\n');

    // Test 5: Get all strings with filter
    console.log('Test 5: GET /strings?is_palindrome=true');
    const filterResponse = await fetch(`${API_URL}/strings?is_palindrome=true`);
    const filterData = await filterResponse.json();
    console.log('Status:', filterResponse.status);
    console.log('Response:', JSON.stringify(filterData, null, 2));
    console.log('✅ Pass\n');

    // Test 6: Natural language query
    console.log('Test 6: GET /strings/filter-by-natural-language');
    const nlpResponse = await fetch(`${API_URL}/strings/filter-by-natural-language?query=all single word palindromic strings`);
    const nlpData = await nlpResponse.json();
    console.log('Status:', nlpResponse.status);
    console.log('Response:', JSON.stringify(nlpData, null, 2));
    console.log('✅ Pass\n');

    // Test 7: Delete string
    console.log('Test 7: DELETE /strings/:string_value');
    const deleteResponse = await fetch(`${API_URL}/strings/hello world`, {
      method: 'DELETE'
    });
    console.log('Status:', deleteResponse.status);
    console.log(deleteResponse.status === 204 ? '✅ Pass\n' : '❌ Fail\n');

    // Test 8: Try to get deleted string (should return 404)
    console.log('Test 8: GET deleted string (should return 404)');
    const notFoundResponse = await fetch(`${API_URL}/strings/hello world`);
    const notFoundData = await notFoundResponse.json();
    console.log('Status:', notFoundResponse.status);
    console.log('Response:', JSON.stringify(notFoundData, null, 2));
    console.log(notFoundResponse.status === 404 ? '✅ Pass\n' : '❌ Fail\n');

    console.log('🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    console.log('\n⚠️  Make sure your server is running on', API_URL);
  }
}

testAPI();
