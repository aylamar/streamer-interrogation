// Import TMI
import tmi from 'tmi.js';
import dotenv from 'dotenv';
import {v4 as uuidv4} from 'uuid';
import {io} from '../app'

dotenv.config();

// Create bot class
class Bot {
    public stateArr: any[];
    public tauntArr: any[];
    public questionArr: any[];
    public currMsg: string | undefined;
    private client: tmi.Client;
    private stateImg: string;
    private tauntImg: string;
    private questionImg: string;

    public constructor() {
        this.client = new tmi.Client({
            options: {debug: false},
            identity: {
                username: process.env.TWITCH_USERNAME,
                password: process.env.TWITCH_OAUTH_TOKEN
            },
            channels: [`${process.env.TWITCH_CHANNEL}`]
        });

        this.client.connect().catch(console.error);
        this.client.on('connected', (address: string, port: number) => {
            console.log(`Connected to ${address}:${port}`);
        });

        // Define empty arrays
        this.stateArr = [];
        this.tauntArr = [];
        this.questionArr = [];

        this.client.on('message', (channel, userState, message, self) => {
            try {
                if (self || !message.startsWith('!')) return;

                const args = message.slice(1).split(' ');
                const command = args.shift()?.toLowerCase();

                // get the rest oif the message
                const msg = args.join(' ');

                // if args are empty, return
                if (msg == '') return;
                if (msg.length > 120) return;

                // get message sender, return if undefined
                const username = userState['display-name'] ?? userState['username'];
                if (!username) return;

                let item = {
                    user: username,
                    msg: msg,
                    type: command,
                    id: uuidv4(),
                    approved: false
                };

                if (command === 'state') {
                    for (let i = 0; i < this.stateArr.length; i++) {
                        if (this.stateArr[i].user === username && this.stateArr[i].msg === msg) {
                            console.log(channel, `${username}, ${msg} is already in the list.`);
                            return;
                        }
                    }
                    item.type = 'state';
                    this.addMsg(item);
                    io.emit('addUnapprovedItem', item);
                }

                if (command === 'flirt') {
                    for (let i = 0; i < this.tauntArr.length; i++) {
                        if (this.tauntArr[i].user === username && this.tauntArr[i].msg === msg) {
                            console.log(channel, `${username}, ${msg} is already in the list.`);
                            return;
                        }
                    }
                    item.type = 'taunt';
                    this.addMsg(item);
                    io.emit('addUnapprovedItem', item);
                }

                if (command === 'question') {
                    for (let i = 0; i < this.questionArr.length; i++) {
                        if (this.questionArr[i].user === username && this.questionArr[i].msg === msg) {
                            console.log(channel, `${username}, ${msg} is already in the list.`);
                            return;
                        }
                    }
                    item.type = 'question';
                    this.addMsg(item);
                    io.emit('addUnapprovedItem', item);
                }
            } catch (error) {
                console.log(error);
            }
        });

        this.questionImg = 'https://i.imgur.com/removed.png';
        this.stateImg = 'https://i.imgur.com/removed.png';
        this.tauntImg = 'https://i.imgur.com/removed.png';

        this.setCurrMsg('', '');
    }

    // Set currMsg
    public setCurrMsg(msg: string, imageUrl: string) {
        try {
            this.currMsg = msg;
            let data = {
                msg: msg,
                url: imageUrl,
            };
            io.emit('newStreamerMsg', data);
            return true;
        } catch (err) {
            this.currMsg = '';
            console.log(err);
            return false;
        }
    }

    public sendMessage(id: string, type: string) {
        const validTypes = ['state', 'taunt', 'question'];
        if (!validTypes.includes(type)) return;

        try {
            let msg = this.getMsg(id, type);
            let state = this.deleteMsg(id, type);

            // get imageUrl based on type
            let imageUrl = '';
            if (type === 'state') {
                imageUrl = this.stateImg;
            } else if (type === 'taunt') {
                imageUrl = this.tauntImg;
            } else if (type === 'question') {
                imageUrl = this.questionImg;
            }

            if (state) {
                console.log(imageUrl)
                this.setCurrMsg(msg, imageUrl);
                return true
            } else {
                return false
            }
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    public mutateMessageId(id: string, type: string) {
        let message = this.getMsg(id, type);
        let newId = uuidv4();
        let state = this.deleteMsg(id, type);
        if (state) {
            let item = {
                user: message.user,
                msg: message.msg,
                type: message.type,
                id: newId,
                approved: true
            };
            this.addMsg(item);
            return item;
        } else {
            return false;
        }
    }

    // add message to array based on type
    public addMsg(item: any) {
        try {
            if (item.type === 'state') {
                this.stateArr.push(item);
            } else if (item.type === 'taunt') {
                this.tauntArr.push(item);
            } else if (item.type === 'question') {
                this.questionArr.push(item);
            }
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    public clearMessage() {
        try {
            this.setCurrMsg('', '');
            io.emit('clearStreamerMsg');
            return true
        } catch (err) {
            return false;
        }
    }

    // approve a message using id and type
    public approveMsg(id: string, type: string) {
        try {
            if (type === 'state') {
                for (let i = 0; i < this.stateArr.length; i++) {
                    if (this.stateArr[i].id === id) {
                        this.stateArr[i].approved = true;
                        this.stateArr[i].id = uuidv4();
                        return this.stateArr[i]
                    }
                }
            } else if (type === 'taunt') {
                for (let i = 0; i < this.tauntArr.length; i++) {
                    if (this.tauntArr[i].id === id) {
                        this.tauntArr[i].approved = true;
                        this.tauntArr[i].id = uuidv4();
                        return this.stateArr[i]
                    }
                }
            } else if (type === 'question') {
                for (let i = 0; i < this.questionArr.length; i++) {
                    if (this.questionArr[i].id === id) {
                        this.questionArr[i].approved = true;
                        this.questionArr[i].id = uuidv4();
                        return this.questionArr[i]
                    }
                }
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
            return false
        }
    }

    // get message by id and type
    public getMsg(id: string, type: string) {
        try {
            if (type === 'state') {
                for (let i = 0; i < this.stateArr.length; i++) {
                    if (this.stateArr[i].id === id) {
                        return this.stateArr[i];
                    }
                }
            } else if (type === 'taunt') {
                for (let i = 0; i < this.tauntArr.length; i++) {
                    if (this.tauntArr[i].id === id) {
                        return this.tauntArr[i];
                    }
                }
            } else if (type === 'question') {
                for (let i = 0; i < this.questionArr.length; i++) {
                    if (this.questionArr[i].id === id) {
                        return this.questionArr[i];
                    }
                }
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    // delete message by id and type
    public deleteMsg(id: string, type: string) {
        try {
            if (type === 'state') {
                for (let i = 0; i < this.stateArr.length; i++) {
                    if (this.stateArr[i].id === id) {
                        this.stateArr.splice(i, 1);
                        return true;
                    }
                }
            } else if (type === 'taunt') {
                for (let i = 0; i < this.tauntArr.length; i++) {
                    if (this.tauntArr[i].id === id) {
                        this.tauntArr.splice(i, 1);
                        return true;
                    }
                }
            } else if (type === 'question') {
                for (let i = 0; i < this.questionArr.length; i++) {
                    if (this.questionArr[i].id === id) {
                        this.questionArr.splice(i, 1);
                        return true;
                    }
                }
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    // get all messages by type with approved = false
    public getAllMessagesByType(type: string, approved: boolean) {
        try {
            if (type === 'state') {
                return this.stateArr.filter(item => item.approved === approved);
            } else if (type === 'taunt') {
                return this.tauntArr.filter(item => item.approved === approved);
            } else if (type === 'question') {
                return this.questionArr.filter(item => item.approved === approved);
            } else {
                return null;
            }
        } catch (err) {
            console.log(err);
        }
    }

    // get random message from array based on type
    public getRandomMessageByType(type: string) {
        try {
            if (type === 'state') {
                return this.stateArr[Math.floor(Math.random() * this.stateArr.length)];
            } else if (type === 'taunt') {
                return this.tauntArr[Math.floor(Math.random() * this.tauntArr.length)];
            } else if (type === 'question') {
                return this.questionArr[Math.floor(Math.random() * this.questionArr.length)];
            } else {
                return null;
            }
        } catch (err) {
            console.log(err);
        }
    }

    public setRandomMessage(type: string) {
        const validTypes = ['state', 'taunt', 'question'];
        try {
            // if type is in valid types, get random message with type
            if (validTypes.includes(type)) {
                const msg = this.getRandomMessageByType(type);
                // if message is not null, set message to current message
                if (msg) {
                    this.sendMessage(msg.id, msg.type)
                    io.emit('deleteItem', msg.id)
                    return true
                } else {
                    return false
                }
            }
        } catch (err) {
            console.log(err);
            return false
        }
    }

    public setImage(type: string, url: string) {
        try {
            if (type === 'state') {
                this.stateImg = url;
                return true;
            } else if (type === 'taunt') {
                this.tauntImg = url;
                return true;
            } else if (type === 'question') {
                console.log(this.questionImg, 'question1')
                this.questionImg = url;
                console.log(this.questionImg, 'question')
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
            return false
        }
    }

    public getImage(type: string) {
        try {
            if (type === 'state') {
                return this.stateImg;
            } else if (type === 'taunt') {
                return this.tauntImg;
            } else if (type === 'question') {
                return this.questionImg;
            } else {
                return null;
            }
        } catch (err) {
            console.log(err);
            return null;
        }
    }

}

export default Bot;
