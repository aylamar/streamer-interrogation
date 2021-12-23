import express from 'express';
import Bot from './bot/bot';
import { Server } from 'socket.io';

const app = express();
const server = app.listen(3000, () => console.log('listening on port 3000'));
export const io = new Server(server);
export const TwitchBot = new Bot()

// Configure
app.use(express.static('public'));

// import routes
import apiRoute from './routes/api';
import adminRoute from './routes/admin';
import streamerRoute from './routes/streamer';

app.use('/api', apiRoute);
app.use('/admin', adminRoute);
app.use('/streamer', streamerRoute);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../' +  '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
});