// Import dependencies
import express from 'express';
import { TwitchBot } from '../app';

const router = express.Router();

// Setup router
router.get('/', async (req, res) => {
    res.render('admin', {
        stateArr: TwitchBot.stateArr,
        appStateArr: TwitchBot.approvedState,
        tauntArr: TwitchBot.tauntArr,
        appTauntArr: TwitchBot.approvedTaunt,
        questionArr: TwitchBot.questionArr,
        appQuestionArr: TwitchBot.approvedQuestion,
        curMsg: TwitchBot.currMsg
    });
});

router.post('/send', async (req, res) => {
    switch (req.body.type) {
        case 'state':
            TwitchBot.getRandomState();
            break;
        case 'taunt':
            TwitchBot.getRandomTaunt();
            break;
        case 'question':
            TwitchBot.getRandomQuestion();
            break;
        case 'clear':
            TwitchBot.setCurrMsg('');
            break;
        default:
            break;
    }
    res.redirect('/admin');
});

router.post('/state', async (req, res) => {
    // console.log(req.body.user, req.body.msg);
    if (!req.body.user || !req.body.msg) res.redirect('/admin');

    if (req.body.type === 'delete') {
        TwitchBot.deleteStateItem(req.body.user, req.body.msg);
    } else if (req.body.type === 'approve') {
        if (TwitchBot.approvedState.find(x => x.user === req.body.user && x.msg === req.body.msg)) {
            res.redirect('/admin');
        } else {
            TwitchBot.approveStateItem(req.body.user, req.body.msg);
        }
    }
    res.redirect('/admin');
});

router.post('/taunt', async (req, res) => {
    // console.log(req.body.user, req.body.msg);
    if (!req.body.user || !req.body.msg) res.redirect('/admin');

    if (req.body.type === 'delete') {
        TwitchBot.deleteTauntItem(req.body.user, req.body.msg);
    } else if (req.body.type === 'approve') {
        // check to see if the user has already approved this taunt
        if (TwitchBot.approvedTaunt.find(x => x.user === req.body.user && x.msg === req.body.msg)) {
            res.redirect('/admin');
        } else {
            TwitchBot.approveTauntItem(req.body.user, req.body.msg);
        }
    }
    res.redirect('/admin');
});

router.post('/question', async (req, res) => {
    // console.log(req.body.user, req.body.msg);
    if (!req.body.user || !req.body.msg) res.redirect('/admin');

    if (req.body.type === 'delete') {
        TwitchBot.deleteQuestionItem(req.body.user, req.body.msg);
    } else if (req.body.type === 'approve') {
        // check to see if the user has already approved this question
        if (TwitchBot.approvedQuestion.find(x => x.user === req.body.user && x.msg === req.body.msg)) {
            res.redirect('/admin');
        } else {
            TwitchBot.approveQuestionItem(req.body.user, req.body.msg);
        }
    }
    res.redirect('/admin');
});

// Export router
export default router;
