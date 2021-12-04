// Import dependencies
import express from 'express';
import { TwitchBot } from '../app';

const router = express.Router();
const alert_img = process.env.ALERT_IMG;

// Setup router
router.get('/', async (req, res) => {
    try {
        res.render('streamer_view', { msg: TwitchBot.currMsg, img: alert_img });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
});

// submit route that clears the current message if messages match
router.post('/submit', async (req, res) => {
    try {
        if (req.body.msg == TwitchBot.currMsg && TwitchBot.currMsg != '') {
            console.log('Clearing message');
            TwitchBot.currMsg = '';
            res.redirect('/streamer_view');
        } else {
            console.log('Redirecting, no need to clear message');
            res.redirect('/streamer_view');
        }
    } catch (err) {
        console.log(err);
        res.redirect('/streamer_view');
    }
});

// Export router
export default router;
