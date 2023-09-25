// import { urlencoded } from 'body-parser';
import  express from 'express'
import  bodyParser from 'body-parser'
import mongoose from 'mongoose';
import  twilio from 'twilio'

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const accountSid = 'AC35d86e0d9c60d2eb91c76053c7c863e1';
const authToken = 'f365934280e53aec57a78def18eb350d';
const client = twilio(accountSid, authToken);

const orderSchema = new mongoose.Schema({
    orderId: String,
    isConfirmed: Boolean,
    // Other fields as needed
  });
  const Order = mongoose.model('Order', orderSchema);
  app.post('/add-initial-order', async (req, res) => {
    try {
      const newOrder = new Order({
        orderId: '12345678', // Provide a unique order ID
        isConfirmed: false, // Initially, set isConfirmed to false
        // Set other order properties as needed
      });
  
      const savedOrder = await newOrder.save();
  
      res.json(savedOrder);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
// Define a route to confirm an order
app.post('/confirm-order', async (req, res) => {
    try {
      const { _id } = req.body; // Get the MongoDB _id from the request
  
      // Update the order to set isConfirmed to true
      const order = await Order.findOne({_id})

  
      if (order) {
        order.isConfirmed = true;
        await order.save();
        res.send('Order confirmed successfully');
      } else {
        res.status(404).send('Order not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  
// Start the server
app.post('/trigger-call', async (req, res) => {
    try {
      // Check the condition (for example, based on orderId)
      const _id = req.body._id; // Get the orderId from the request
      const order = await Order.findOne({ _id });
  
      if (order && order.isConfirmed) {
        // If the condition is met, trigger the call
        const vendorPhone = '+919167787316'; // Vendor's phone number
        const twilioPhone = '+13343103728'; // Your Twilio phone number
        const statusCallbackUrl = 'http://https://423b-103-134-156-215.ngrok-free.app/call-status'; 

        client.calls
          .create({
            twiml: '<Response><Say>Press 1 to continue </Say></Response>',
            to: vendorPhone,
            from: twilioPhone,
            statusCallback: statusCallbackUrl, // Set the statusCallback URL
            statusCallbackEvent: ['answered'], // Notify on call answer
          })
          .then((call) => {
            console.log('Call SID: ' + call.sid);
          })
          .catch((error) => {
            console.error('call not found: ' + error);
          });
  
        res.send('Calling vendor...');
      } else {
        res.send('Condition not met. No call initiated.');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  app.post('/call-status', (req, res) => {
    const callSid = req.body.CallSid;
    const callStatus = req.body.CallStatus;
    console.log(`Call SID: ${callSid}, Call Status: ${callStatus}`);
    res.status(200).end();
  });
  
mongoose.connect('mongodb+srv://onlyaddy68:onlyaddy123@confess.bgv01wx.mongodb.net/mtwilio?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(()=>{
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
 
}).catch((error)=>{
    console.log(error);
})