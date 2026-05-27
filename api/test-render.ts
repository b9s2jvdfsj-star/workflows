import axios from 'axios';

// Test script to simulate a client request to the /generate-video endpoint
const testRenderRequest = async () => {
  try {
    console.log('Testing video generation request...');
    
    // Test payload with regional localization parameters
    const payload = {
      prompt: 'Create a promotional video for a new eco-friendly product',
      region: 'EU',
      language: 'de'
    };
    
    // Make request to the API endpoint
    const response = await axios.post('http://localhost:3000/generate-video', payload);
    
    console.log('Request successful!');
    console.log('Response:', response.data);
    
    // Additional test cases
    console.log('\n--- Testing additional scenarios ---');
    
    // Test with different region
    const usResponse = await axios.post('http://localhost:3000/generate-video', {
      prompt: 'Summer vacation montage',
      region: 'US',
      language: 'en'
    });
    console.log('US request response:', usResponse.data);
    
    // Test with Asian region
    const jpResponse = await axios.post('http://localhost:3000/generate-video', {
      prompt: 'Traditional Japanese tea ceremony',
      region: 'JP',
      language: 'ja'
    });
    console.log('Japan request response:', jpResponse.data);
    
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      console.error('API returned an error:', (error as any).response.data);
    } else if (error && typeof error === 'object' && 'request' in error) {
      console.error('No response received from API. Is the server running?');
    } else {
      console.error('Error setting up request:', error instanceof Error ? error.message : String(error));
    }
    console.error('Full error details:', error);
  }
};

// Run the test
testRenderRequest();