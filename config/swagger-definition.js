const pkg = require('../package.json');

const apiVersion = process.env.API_VERSION || 3;

module.exports = {
  openapi: '3.0.1',
  info: {
    title: `GROWI REST API v${apiVersion}`,
    version: pkg.version,
  },
  servers: [
    {
      url: 'https://demo.growi.org',
    },
  ],
  apis: ['src/server/**/*.js']
};
