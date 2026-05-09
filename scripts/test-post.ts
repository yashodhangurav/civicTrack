async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/complaints/69feac182991005eac4ad7f4/transition', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status_name: "Assigned",
        comment: "Test assignment",
        assignedToId: "69fe2d4a34beeb302b35bb2e",
      })
    });
    console.log(res.status);
    console.log(await res.text());
  } catch(e) {
    console.error(e);
  }
}
test();
