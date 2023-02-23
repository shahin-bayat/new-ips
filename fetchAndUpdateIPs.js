const fs = require("fs")
const axios = require("axios")
const { updateARecords } = require("./updateARecords")

const OLD_FILE_PATH = "old.txt"
const NEW_FILE_PATH = "new.txt"

async function getIPs() {
  const res = await axios.get("http://bot.sudoer.net/best.cf.iran.all")
  const ipRegex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/
  const requiredISPs = ["HWB", "IRC", "MCI", "MKB", "RTL", "ZTL"]
  const matchingIPs = []

  res.data.split("\n").forEach(line => {
    if (requiredISPs.every(isp => line.includes(isp))) {
      const ipMatch = line.match(ipRegex)
      if (ipMatch) {
        matchingIPs.push(ipMatch[0])
      }
    }
  })

  console.log(
    `Fetched ${
      matchingIPs.length
    } matching IPs at ${new Date().toLocaleString()}`
  )

  return matchingIPs
}

async function compareIPs(oldIPs, newIPs) {
  const addedIPs = newIPs.filter(ip => !oldIPs.includes(ip))
  return addedIPs
}

async function main() {
  const ips = await getIPs()
  if (!ips.length) return

  // check if old ips file does not exists - first run
  if (!fs.existsSync(OLD_FILE_PATH)) {
    console.log("old file does not exist, creating it")
    await fs.promises.writeFile(OLD_FILE_PATH, ips.join("\n"))
    return
  }
  console.log("old file exists, comparing IPs")
  const oldIPs = (await fs.promises.readFile(OLD_FILE_PATH, "utf8")).split("\n")
  const addedIPs = await compareIPs(oldIPs, ips)

  if (addedIPs.length > 0) {
    console.log(`Found ${addedIPs.length} new IPs`)
    console.log(addedIPs)

    for (const ip of addedIPs) {
      await updateARecords(process.env.DOMAIN, ip)
    }
    await fs.promises.writeFile(NEW_FILE_PATH, addedIPs.join("\n"))
  } else {
    console.log("no new IPs found")
  }

  // update old ips file
  await fs.promises.writeFile(OLD_FILE_PATH, ips.join("\n"))
}

module.exports = { main }
