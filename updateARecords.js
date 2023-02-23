const axios = require("axios")

async function updateARecords(domain, ipAddress) {
  try {
    const response = await axios.get(
      `${process.env.URL}/dns_records?type=A&name=${domain}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (response.data.success) {
      const oldRecords = response.data.result
      const promises = []
      oldRecords.forEach(record => {
        const deleteUrl = `${process.env.URL}/dns_records/${record.id}`
        promises.push(
          axios.delete(deleteUrl, {
            headers: {
              Authorization: `Bearer ${process.env.API_TOKEN}`,
              "Content-Type": "application/json",
            },
          })
        )
      })

      await Promise.all(promises)
      // All old A records have been deleted, now create a new one
      const createUrl = `${process.env.URL}/dns_records`
      const createData = {
        type: "A",
        name: domain,
        content: ipAddress,
        ttl: 1,
        proxied: false,
      }
      const createResponse = await axios.post(createUrl, createData, {
        headers: {
          Authorization: `Bearer ${process.env.API_TOKEN}`,
          "Content-Type": "application/json",
        },
      })

      if (createResponse.data.success) {
        console.log(
          `Successfully created A record for ${domain} with IP address ${ipAddress}`
        )
      } else {
        console.error(
          `Failed to create A record for ${domain}. Reason: ${createResponse.data.errors[0].message}`
        )
      }
    } else {
      console.error(
        `Failed to retrieve A records for ${domain}. Reason: ${response.data.errors[0].message}`
      )
    }
  } catch (error) {
    console.error(`Error updating A records for ${domain}: ${error.message}`)
  }
}

module.exports = { updateARecords }
