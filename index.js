const { main } = require("./fetchAndUpdateIPs")

setInterval(async () => {
  await main()
}, 1000 * 60 * 15)
