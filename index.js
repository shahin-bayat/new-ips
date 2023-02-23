const { main } = require("./fetchAndUpdateIPs")

const MINUTE = 1000 * 60

setInterval(async () => {
  await main()
}, MINUTE * 10)
