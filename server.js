const express = require('express')
const path = require('path')
const app = express()

app.use(express.static(path.join(__dirname)))

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'))
})
const port = process.env.PORT || 3008
app.listen(port, () => console.log('Server is running on localhost: ' + port))
