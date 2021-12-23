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
    public currImg: string | undefined;
    private client: tmi.Client;

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

        this.setCurrMsg('');
    }

    // Set currMsg
    public setCurrMsg(msg: string) {
        try {
            this.currMsg = msg;
            let data = {
                msg: msg,
                url: 'https://i.imgur.com/removed.png'
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
        try {
            let msg = this.getMsg(id, type);
            let state = this.deleteMsg(id, type);
            if (state) {
                this.setCurrMsg(msg);
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
            console.log('hit')
            this.setCurrMsg('');
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
            }

            if (type === 'taunt') {
                for (let i = 0; i < this.tauntArr.length; i++) {
                    if (this.tauntArr[i].id === id) {
                        this.tauntArr[i].approved = true;
                        this.tauntArr[i].id = uuidv4();
                        return this.stateArr[i]
                    }
                }
            }

            if (type === 'question') {
                for (let i = 0; i < this.questionArr.length; i++) {
                    if (this.questionArr[i].id === id) {
                        this.questionArr[i].approved = true;
                        this.questionArr[i].id = uuidv4();
                        return this.questionArr[i]
                    }
                }
            }
            return false
        } catch (err) {
            console.log(err);
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
            }

            if (type === 'taunt') {
                for (let i = 0; i < this.tauntArr.length; i++) {
                    if (this.tauntArr[i].id === id) {
                        return this.tauntArr[i];
                    }
                }
            }

            if (type === 'question') {
                for (let i = 0; i < this.questionArr.length; i++) {
                    if (this.questionArr[i].id === id) {
                        return this.questionArr[i];
                    }
                }
            }
            return null
        } catch (err) {
            console.log(err);
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
            }

            if (type === 'taunt') {
                for (let i = 0; i < this.tauntArr.length; i++) {
                    if (this.tauntArr[i].id === id) {
                        this.tauntArr.splice(i, 1);
                        return true;
                    }
                }
            }

            if (type === 'question') {
                for (let i = 0; i < this.questionArr.length; i++) {
                    if (this.questionArr[i].id === id) {
                        this.questionArr.splice(i, 1);
                        return true;
                    }
                }
            }
            return false
        } catch (err) {
            console.log(err);
        }
    }

    // get all messages by type with approved = false
    public getAllMessagesByType(type: string, approved: boolean) {
        try {
            if (type === 'state') {
                return this.stateArr.filter(item => item.approved === approved);
            }

            if (type === 'taunt') {
                return this.tauntArr.filter(item => item.approved === approved);
            }

            if (type === 'question') {
                return this.questionArr.filter(item => item.approved === approved);
            }
            return null
        } catch (err) {
            console.log(err);
        }
    }

    // get random message from array based on type
    public getRandomMessageByType(type: string) {
        try {
            if (type === 'state') {
                return this.stateArr[Math.floor(Math.random() * this.stateArr.length)];
            }

            if (type === 'taunt') {
                return this.tauntArr[Math.floor(Math.random() * this.tauntArr.length)];
            }

            if (type === 'question') {
                return this.questionArr[Math.floor(Math.random() * this.questionArr.length)];
            }
            return null
        } catch (err) {
            console.log(err);
        }
    }

    public setRandomMessage(type: string) {
        try {
            if (type === 'state') {
                const msg = this.getRandomMessageByType(type);
                this.sendMessage(msg.id, msg.type)
                io.emit('deleteItem', msg.id)
                return true
            } else if (type === 'taunt') {
                const msg = this.getRandomMessageByType(type);
                this.sendMessage(msg.id, msg.type)
                io.emit('deleteItem', msg.id)
                return true
            } else if (type === 'question') {
                const msg = this.getRandomMessageByType(type);
                this.sendMessage(msg.id, msg.type)
                io.emit('deleteItem', msg.id)
                return true
            } else {
                return false
            }
        } catch (err) {
            console.log(err);
        }
    }


}

export default Bot;
