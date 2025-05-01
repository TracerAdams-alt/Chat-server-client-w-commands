const net = require('net');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const client = net.createConnection({ port: 5001 }, () => {
  console.log('Connected to the server');
});

client.on('data', (data) => {
  // Print server messages only (do not print the client's own messages)
  console.log(data.toString());
});

client.on('end', () => {
  console.log('Disconnected from server');
});

client.on('error', (err) => {
  console.error('Connection error:', err.message);
});

rl.question('', (name) => {
  client.write(name + '\n');  // Send the name to the server
  
  rl.prompt();
  rl.on('line', (input) => {
    if (input) {
      // The client sends messages, but does not echo them back to itself
      client.write(input + '\n');
    }
  });
});
