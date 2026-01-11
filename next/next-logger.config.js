const pino = require('pino')

const logger = defaultConfig =>
  pino({
    ...defaultConfig,
    level: "info",
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
  })

module.exports = {
  logger,
}