const net = require('net');

const clients = [];

const server = net.createServer((client) => {
  client.name = null;
  clients.push(client);

  client.write('Welcome! Please enter your name:\n');

  client.on('data', (data) => {
    const message = data.toString().trim();

    if (!client.name) {
      client.name = message;
      console.log(`${client.name} has joined the chat.`);
      return;
    }

    console.log(`${client.name}: ${message}`);
  });

  client.on('end', () => {
    const index = clients.indexOf(client);
    if (index !== -1) clients.splice(index, 1);

    if (client.name) {
      console.log(`${client.name} has left the chat.`);

      for (let i = 0; i < clients.length; i++) {
        const otherClient = clients[i];
        if (otherClient.name) {
          otherClient.write(`${client.name} has left the chat.\n`);
        }
      }
    }
  });

  client.on('error', (err) => {
    console.error('Client error:', err.message);
  });

}).listen(5001, () => {
  console.log('Listening on port 5001');
});
