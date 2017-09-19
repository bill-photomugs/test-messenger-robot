const express = require('express')
const app = express()
const verify_token = "bill_test_messenger_bot"

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(3256, function () {
  console.log('Example app listening on port 3256!')
})

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === verify_token) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});