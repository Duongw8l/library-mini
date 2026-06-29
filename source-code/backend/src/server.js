const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Library API đang chạy tại http://localhost:${env.port}/api`);
  // eslint-disable-next-line no-console
  console.log(`   Healthcheck: http://localhost:${env.port}/api/health`);
});
