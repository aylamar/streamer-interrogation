import express from "express";
import {io, TwitchBot} from "../app";

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).send('test');
});

router.get('/current', (req, res) => {
    let msg = TwitchBot.currMsg;
    if (msg === "" || msg === undefined) {
        io.emit('clearStreamerMsg')
        res.status(200).send(msg);
    } else {
        io.emit('newStreamerMsg', msg);
        res.status(200).send(msg);
    }
});

router.delete('/send/:type' , (req, res) => {
    let state = TwitchBot.setRandomMessage(req.params.type);
    if (state) {
        res.status(200).send(TwitchBot.currMsg);
    } else {
        res.status(500).send('Error');
    }
});

// get all items in current state arr
router.get('/:status/:type', (req, res) => {
    const status = req.params.status;
    const type = req.params.type;

    // if status is unapproved, return all items with "approved" === false for that type
    if (status === 'unapproved') {
        const messages = TwitchBot.getAllMessagesByType(type, false);
        return res.status(200).send(messages);
    }

    if (status === 'approved') {
        const messages = TwitchBot.getAllMessagesByType(type, true)
        return res.status(200).send(messages);
    }
});

router.delete('/uap/:status/:type/:id', (req, res) => {
    // if status is "approve", mark as approved
    if (req.params.status === 'approve') {
        let msg = TwitchBot.approveMsg(req.params.id, req.params.type);
        if (msg) {
            io.emit('deleteItem', req.params.id);
            io.emit('addApprovedItem', msg);
            return res.status(200).send('Approved');
        } else {
            return res.status(404).send('Not found');
        }
    }

    if (req.params.status === 'deny') {
        let state = TwitchBot.deleteMsg(req.params.id, req.params.type);
        if (state) {
            io.emit('deleteItem', req.params.id);
            return res.status(200).send('Approved');
        } else {
            return res.status(404).send('Not found');
        }
    }

    return res.status(404).send('Not found');
});

router.delete('/ap/:status/:type/:id', (req, res) => {
    if (req.params.status === 'send') {
        let state = TwitchBot.sendMessage(req.params.id, req.params.type);
        if (state) {
            io.emit('deleteItem', req.params.id);
            return res.status(200).send('Approved');
        } else {
            return res.status(404).send('Not found');
        }
    }
    if (req.params.status === 'delete') {
        let state = TwitchBot.deleteMsg(req.params.id, req.params.type);
        if (state) {
            io.emit('deleteItem', req.params.id);
            return res.status(200).send('Approved');
        } else {
            return res.status(404).send('Not found');
        }
    }
});

router.delete('/clear', (req, res) => {
    let state = TwitchBot.clearMessage()
    if (state) {
        return res.status(200).send('Approved');
    } else {
        return res.status(404).send('Not found');
    }
});

export default router