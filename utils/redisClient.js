const redis = require('redis');
const client = redis.createClient();

client.on('connect', () => {
    console.log('Redis is connected');
});

client.on('error', (err) => {
    console.error('Redis error:', err);
});

const redisConnect = async () => {
    await client.connect(); // Await the connection
};

redisConnect();


module.exports = client;
