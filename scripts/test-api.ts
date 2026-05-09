import http from 'http';

const req = http.request(
  {
    hostname: 'localhost',
    port: 3000,
    path: '/api/complaints/69feac182991005eac4ad7f4/transition',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  },
  (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Body: ${data}`);
    });
  }
);

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(
  JSON.stringify({
    status_name: "Assigned",
    comment: "Test assignment",
    assignedToId: "69fe2d4a34beeb302b35bb2e",
  })
);
req.end();
