module.exports = {
  apps: [{
    name: 'erp-backend',
    script: './server.js',
    instances: 1, // Use 1 instance on Windows
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=1024'
    },
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    time: true
  }]
};
