module.exports = {
  apps : [{
    name: 'driverlOG',
    script: 'app.js',
    instances: 'max',
    autorestart: true,
    watch: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
//pm2 start ecosystem.config.js --env production
// pm2 status
// pm2 stop myapp
// pm2 restart myapp
// pm2 reload myapp
