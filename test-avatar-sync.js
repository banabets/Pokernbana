// Script simple para probar recepción de UPDATE_AVATAR
const io = require('socket.io-client');

console.log('🧪 TEST: Starting simple UPDATE_AVATAR test...');

const client = io('http://localhost:4000', {
  transports: ['websocket', 'polling']
});

client.on('connect', () => {
  console.log('🎭 CLIENT: Connected to server');

  // Enviar UPDATE_AVATAR inmediatamente después de conectar
  setTimeout(() => {
    console.log('🎭 CLIENT: Sending updateAvatar event...');
    client.emit('updateAvatar', '🔥');
    console.log('🎭 CLIENT: updateAvatar event sent successfully');
  }, 1000);
});

client.on('USER_CONNECTED', (data) => {
  console.log('🎭 CLIENT: Received USER_CONNECTED:', data);
});

client.on('disconnect', () => {
  console.log('🎭 CLIENT: Disconnected from server');
});

client.on('connect_error', (error) => {
  console.log('🎭 CLIENT: Connection error:', error);
});

setTimeout(() => {
  console.log('🧪 TEST: Test completed, disconnecting...');
  client.disconnect();
}, 5000);
