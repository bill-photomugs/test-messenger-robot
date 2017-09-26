const express = require('express')
const app = express()
const verify_token = "verify_token"
const PAGE_ACCESS_TOKEN = "PAGE_ACCESS_TOKEN"
var bodyParser = require('body-parser')
var request    = require('request');
var Parser     = require('./config/parser.js');
var parser     = new Parser();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.send("Facebook chatbot work!")
  // res.send(testParser())
  // res.send(testParser());
})

app.listen(3256, function () {
  console.log('Example app listening on port 3256!');
  
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

// !!針對發信者ID即可透過POST回應訊息。要注意的是當您的應用程式未發布之前只能用管理者帳號進行測試或是手動加入測試帳號。!!
// 在這個應用程式範例中，我們會處理所有的回呼。在接收訊息時，我們會尋找 event.message 欄位，然後呼叫 receivedMessage 函式。
app.post('/webhook', function (req, res) {
  var data = req.body;
  console.log("data:", data)
  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
  else{
    res.sendStatus(403)
  }
  
});

// 在 receivedMessage 中，我們設計的邏輯是將訊息傳回給用戶。預設行為是回送已接收的訊息。
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    let imageUrl = [];
    // sendTextMessage(senderID, "Message with attachment received");
    sendTextMessage(senderID, "Awesome photo! Hang tight while I do my thing...");
    sendProductMessage(senderID, messageAttachments)
        
  }
}

// sendTextMessage 會編排要求中資料的格式：
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

// callSendAPI 會呼叫「傳送 API」：
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

// 接收到圖片,回覆圖片
function sendProductMessage(recipientId, attachment) {
  let imageUrl = attachment[0].payload.url;
  let renderedImages = parser.renderImage(imageUrl);
  let elements = parser.setMessageElements();
  console.log("elements: ", elements)
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: elements
        }
      }
    }
  };  
  
  // template
  // var messageData = {
  //   recipient: {
  //     id: recipientId
  //   },
  //   message: {
  //     attachment: {
  //       type: "template",
  //       payload: {
  //         template_type: "generic",
  //         elements: [{
  //           title: "rift",
  //           subtitle: "Next-generation virtual reality",
  //           item_url: imageUrl,               
  //           image_url: imageUrl,
  //           buttons: [{
  //             type: "web_url",
  //             url: "https://www.oculus.com/en-us/rift/",
  //             title: "Open Web URL"
  //           }, {
  //             type: "postback",
  //             title: "Call Postback",
  //             payload: "Payload for first bubble",
  //           }],
  //         }, {
  //           title: "touch",
  //           subtitle: "Your Hands, Now in VR",
  //           item_url: "https://www.oculus.com/en-us/touch/",               
  //           image_url: "http://messengerdemo.parseapp.com/img/touch.png",
  //           buttons: [{
  //             type: "web_url",
  //             url: "https://www.oculus.com/en-us/touch/",
  //             title: "Open Web URL"
  //           }, {
  //             type: "postback",
  //             title: "Call Postback",
  //             payload: "Payload for second bubble",
  //           }]
  //         }]
  //       }
  //     }
  //   }
  // };  
  
  callSendAPI(messageData);
}


// 發送結構化訊息: 對於特定關鍵字，receivedMessage 還會傳回其他類型的訊息。如果您發送訊息「generic」，其會呼叫 sendGenericMessage，而傳回使用一般型範本的結構化訊息。
function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };  
  
  callSendAPI(messageData);
}

//for test in local
function testParser(){
  let imageUrl = "https://scontent.ftpe7-4.fna.fbcdn.net/v/t35.0-12/21951808_120585718647069_601553202_o.jpg?oh=4eeb81342d89b52f9d312fa56676e755&oe=59CB9DF5";
  let renderedImages = parser.renderImage(imageUrl);
  let elements = parser.setMessageElements();
  let recipientId = 123
  console.log("elements: ", elements)
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: elements
        }
      }
    }
  };  
  return messageData;
}