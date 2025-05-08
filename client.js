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
  process.exit(0);
});

client.on('error', (err) => {
  console.error('Connection error:', err.message);
  rl.close();
  process.exit(1);
});

rl.on('line', (input) => {
  if (input.trim().toLowerCase() === 'exit') {
    console.log('Exiting chat...');
    client.end();
  } else {
    client.write(input);
  }
});