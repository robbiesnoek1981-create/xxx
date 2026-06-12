const dgram = require('dgram');

const WIZ_PORT = 38899;
const TIMEOUT_MS = 3000;

function sendUdpCommand(ip, payload) {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket('udp4');
    const message = Buffer.from(JSON.stringify(payload));
    let settled = false;

    const done = (err, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.close();
      if (err) reject(err);
      else resolve(result);
    };

    const timer = setTimeout(() => done(new Error('UDP timeout'), null), TIMEOUT_MS);

    socket.on('message', (msg) => {
      try {
        done(null, JSON.parse(msg.toString()));
      } catch (e) {
        done(e, null);
      }
    });

    socket.on('error', (err) => done(err, null));

    socket.send(message, WIZ_PORT, ip, (err) => {
      if (err) done(err, null);
    });
  });
}

async function setPilot(ip, params) {
  const payload = { method: 'setPilot', params };
  return sendUdpCommand(ip, payload);
}

async function getPilot(ip) {
  const payload = { method: 'getPilot', params: {} };
  return sendUdpCommand(ip, payload);
}

module.exports = { setPilot, getPilot };
