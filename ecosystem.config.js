module.exports = {
  apps: [{
    name: 'mappertrip.com',
    script: 'npm',
    args: 'start',
    cwd: '/home/mappertrip.com',
    env: {
      NODE_ENV: 'production',
      PORT: 3025
    }
  }]
};
