const net = require('net');
const readline = require('readline');

const client = net.createConnection({ port: 5001 }, () => {
  console.log('Connected to the server');
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

client.on('data', (data) => {
  console.log(data.toString().trim());
});

client.on('end', () => {
  console.log('Disconnected from server');
  rl.close();
});

rl.on('line', (input) => {
  if (input.trim().toLowerCase() === 'exit') {
    client.end();
  } else {
    client.write(input);
  }
});
