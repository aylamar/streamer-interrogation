// Import dependencies
import express from 'express';
import path from 'path';
import Bot from './bot/bot';

// Import routes
import indexRoute from './routes/index';
import adminRoute from './routes/admin';
import streamerRoute from './routes/steamer_view';
import bodyParser from 'body-parser';

// Set view engine
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname + '/../', 'views'));
app.use(bodyParser.urlencoded({ extended: false }));

// Use routes routes
app.use('/', indexRoute);
app.use('/admin', adminRoute)
app.use('/streamer_view', streamerRoute)

// Start listener & alert console
app.listen(80, () => {
    console.log('Server is up on port 80.');
});

// Start bot & export
export const TwitchBot = new Bot()
