import axios from 'axios';

async function run() {
  try {
    const res = await axios.get('http://localhost:5000/api/transfers/batch-conversions?studentId=6a5870c4c615380026260b7a', {
      headers: {
        'x-bypass-auth': 'true'
      }
    });
    console.log('Status:', res.status);
    console.log('Data:', res.data);
  } catch (err) {
    console.log('Error status:', err.response?.status);
    console.log('Error message:', err.response?.data);
  }
}

run();
