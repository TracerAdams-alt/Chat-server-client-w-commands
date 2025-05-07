const net = require('net');

const clients = [];
const adminPassword = "skrimbo!";

const server = net.createServer((client) => {
  client.name = `Guest${Math.floor(Math.random() * 1000)}`;
  clients.push(client);

  client.write(`Welcome to the chat! You are connected as: ${client.name}\n`);
  client.write(`Available commands:\n`);
  client.write(`  /w [username] [message] - Send a private message\n`);
  client.write(`  /username [new_username] - Change your username\n`);
  client.write(`  /kick [username] [admin_password] - Kick a user (admin only)\n`);
  client.write(`  /clientlist - List all connected clients\n`);
  
  broadcastToOthers(`${client.name} has joined the chat.`, client);
  console.log(`${client.name} has joined the chat.`);

  client.on('data', (data) => {
    const message = data.toString().trim();

    if (message.startsWith('/')) {
      handleCommand(client, message);
    } else {
      broadcastToOthers(`${client.name}: ${message}`, client);
      console.log(`${client.name}: ${message}`);
    }
  });

  client.on('end', () => {
    const index = clients.indexOf(client);
    if (index !== -1) clients.splice(index, 1);

    if (client.name) {
      console.log(`${client.name} has left the chat.`);
      broadcastToAll(`${client.name} has left the chat.`);
    }
  });

  client.on('error', (err) => {
    console.error('Client error:', err.message);
    const index = clients.indexOf(client);
    if (index !== -1) clients.splice(index, 1);
  });

}).listen(5001, () => {
  console.log('Listening on port 5001');
});

function broadcastToOthers(message, sender) {
  for (let i = 0; i < clients.length; i++) {
    const client = clients[i];
    if (client !== sender && client.name) {
      client.write(`${message}\n`);
    }
  }
}

function broadcastToAll(message) {
  for (let i = 0; i < clients.length; i++) {
    const client = clients[i];
    if (client.name) {
      client.write(`${message}\n`);
    }
  }
}

function handleCommand(client, message) {
  const parts = message.split(' ');
  const command = parts[0].toLowerCase();

  switch (command) {
    case '/w':
      handleWhisper(client, parts);
      break;
    case '/username':
      handleUsernameChange(client, parts);
      break;
    case '/kick':
      handleKick(client, parts);
      break;
    case '/clientlist':
      handleClientList(client);
      break;
    default:
      client.write(`Unknown command: ${command}\n`);
  }
}

function handleWhisper(client, parts) {
  if (parts.length < 3) {
    client.write("Error: Whisper format is '/w username message'\n");
    return;
  }

  const targetName = parts[1];
  const message = parts.slice(2).join(' ');
  
  const targetClient = clients.find(c => c.name === targetName);
  
  if (targetName === client.name) {
    client.write("Error: You cannot whisper to yourself\n");
    return;
  }
  
  if (!targetClient) {
    client.write(`Error: User '${targetName}' not found\n`);
    return;
  }
  
  targetClient.write(`[Whisper from ${client.name}]: ${message}\n`);
  client.write(`[Whisper to ${targetName}]: ${message}\n`);
}

function handleUsernameChange(client, parts) {
  if (parts.length !== 2) {
    client.write("Error: Username format is '/username newname'\n");
    return;
  }
  
  const newUsername = parts[1];
  
  if (newUsername === client.name) {
    client.write("Error: New username is the same as your current username\n");
    return;
  }
  
  if (clients.some(c => c.name === newUsername)) {
    client.write(`Error: Username '${newUsername}' is already in use\n`);
    return;
  }
  
  const oldUsername = client.name;
  client.name = newUsername;
  
  client.write(`You have successfully changed your username to ${newUsername}\n`);
  
  broadcastToOthers(`${oldUsername} has changed their name to ${newUsername}`, client);
  console.log(`${oldUsername} has changed their name to ${newUsername}`);
}

function handleKick(client, parts) {
  if (parts.length !== 3) {
    client.write("Error: Kick format is '/kick username password'\n");
    return;
  }
  
  const targetName = parts[1];
  const password = parts[2];
  
  // Error checks
  if (password !== adminPassword) {
    client.write("Error: Incorrect admin password\n");
    return;
  }
  
  if (targetName === client.name) {
    client.write("Error: You cannot kick yourself\n");
    return;
  }
  
  const targetClient = clients.find(c => c.name === targetName);
  
  if (!targetClient) {
    client.write(`Error: User '${targetName}' not found\n`);
    return;
  }
  
  targetClient.write(`You have been kicked from the chat by an admin\n`);
  broadcastToOthers(`${targetName} has been kicked from the chat`, client);
  console.log(`${targetName} has been kicked by ${client.name}`);
  
  targetClient.end();
}

function handleClientList(client) {
  const userList = clients.map(c => c.name).join(', ');
  client.write(`Connected users: ${userList}\n`);
}