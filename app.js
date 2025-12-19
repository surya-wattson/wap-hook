// Import Express.js
const express = require('express')

// Create an Express app
const app = express()

// Middleware to parse JSON bodies
app.use(express.json())

// Set port and verify_token
const port = process.env.PORT || 3000
const verifyToken = process.env.VERIFY_TOKEN

// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED')
    res.status(200).send(challenge)
  } else {
    res.status(403).end()
  }
})

// Route for POST requests
const seen = new Set()
app.post('/', (req, res) => {
  // console.log(JSON.stringify(req.body, null, 2))
  const entries = req.body?.entry || []

  entries.forEach((entry) => {
    entry.changes?.forEach((change) => {
      change.value?.statuses?.forEach((s) => {
        if (s.status !== 'sent' && s.status !== 'failed') return
        if (seen.has(s.id)) return

        seen.add(s.id)

        const ts = new Date(Number(s.timestamp) * 1000)
          .toISOString()
          .replace('T', ' ')
          .slice(0, 19)

        console.log(`${s.recipient_id} - ${s.status} - ${ts}`)
      })
    })
  })

  res.sendStatus(200)
})
// app.post('/', (req, res) => {
//   const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
//   console.log(`\n\nWebhook received ${timestamp}\n`);
//   console.log(JSON.stringify(req.body, null, 2));
//   res.status(200).end();
// });

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`)
})
