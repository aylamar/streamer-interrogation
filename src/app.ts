import express from 'express';
import Bot from './bot/bot';
import { Server } from 'socket.io';

const app = express();
let port = process.env.PORT || 80;

const server = app.listen(port, () => console.log('listening on port ' + port));
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