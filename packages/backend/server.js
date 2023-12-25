require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = 5000;

mongoose.connect(`${process.env.MONGO_URL}`);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use(cors());
app.use(express.json());

// Sample schema
const itemSchema = new mongoose.Schema({
  name: String,
  value: Number,
});

const Item = mongoose.model('Item', itemSchema);

app.get('/api/items', async (req, res) => {
    try {
      const allItems = await Item.find();
      res.json(allItems);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
});

server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('getAllItems', async ()=> {
    try {
        const allItems = await Item.find();
        socket.emit('allItems', allItems);
    } catch (error) {
        console.error(error);
    }
  });

  // Handle real-time editing here
  socket.on('editItem', async (editedItem) => {
    try {
      const updatedItem = await Item.findByIdAndUpdate(editedItem._id, editedItem, { new: true });
      io.emit('dataUpdate', updatedItem); // Emit event to update frontend
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('addData', async (newItem) => {
    try {
      const createdItem = await Item.create(newItem);
      io.emit('dataAdded', createdItem); // Emit event to update frontend
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('deleteData', async(delItem) => {
    try{
        const deleteItem = await Item.findByIdAndDelete(delItem._id);
        io.emit('dataDeleted', deleteItem);
    } catch (error) {
        console.error(error);
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
