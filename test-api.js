const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing API endpoint...');

    const response = await fetch('http://localhost:5000/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        level: 'beginner',
        goals: 'Learn algorithms'
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAPI();
