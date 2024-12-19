module.exports = {
  apps: [{
    name: "twitter-manager",
    script: "server.js",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      MONGODB_URI: "your_mongodb_uri",
      ADMIN_PASSWORD: "your_secure_password"
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}; 