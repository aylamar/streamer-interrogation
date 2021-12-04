// Import TMI
import tmi from 'tmi.js';
import dotenv from 'dotenv';

dotenv.config();

// Create bot class
class Bot {
    public stateArr: any[];
    public tauntArr: any[];
    public questionArr: any[];
    public currMsg: string | undefined;
    public approvedState: any[];
    public approvedTaunt: any[];
    public approvedQuestion: any[];
    private client: tmi.Client;

    public constructor() {
        this.client = new tmi.Client({
            options: { debug: false },
            identity: {
                username: process.env.TWITCH_USERNAME,
                password: process.env.TWITCH_OAUTH_TOKEN
            },
            channels: [`${process.env.TWITCH_CHANNEL}`]
        });

        this.client.connect().catch(console.error);
        this.client.on('connected', (address, port) => {
            console.log(`Connected to ${address}:${port}`);
        });

        // Define empty arrays
        this.stateArr = [];
        this.tauntArr = [];
        this.questionArr = [];

        this.approvedState = [];
        this.approvedTaunt = [];
        this.approvedQuestion = [];

        this.client.on('message', (channel, userState, message, self) => {
            if (self || !message.startsWith('!')) return;

            const args = message.slice(1).split(' ');
            const command = args.shift()?.toLowerCase();

            // get the rest oif the message
            const msg = args.join(' ');

            // if args are empty, return
            if (msg == '') return;

            // get message sender, return if undefined
            const username = userState['display-name'] ?? userState['username'];
            if (!username) return;

            if (command === 'state') {
                // add sender and message to state array
                this.stateArr.push({ user: username, msg: msg });
            }

            if (command === 'taunt') {
                this.tauntArr.push({ user: username, msg: msg });
            }
            if (command === 'question') {
                this.questionArr.push({ user: username, msg: msg });
            }

            console.log(this.stateArr);
        });

        this.setCurrMsg('Bot just started, waiting...');
    }

    // Set currMsg
    public setCurrMsg(msg: string) {
        try {
            this.currMsg = msg;
        } catch (err) {
            this.currMsg = '';
            console.log(err);
        }
    }

    // Iterate through stateArr, delete item if user and msg match
    public deleteStateItem(user: string, msg: string) {
        this.stateArr.forEach((item) => {
            if (item.user === user && item.msg === msg) {
                this.stateArr.splice(this.stateArr.indexOf(item), 1);
            }
        });
    }

    // Add item to approvedState, then remove from stateArr
    public approveStateItem(user: string, msg: string) {
        this.approvedState.push({ user: user, msg: msg });
        this.deleteStateItem(user, msg);
    }

    // Get random message from approvedState, then delete item from approvedState
    public getRandomState() {
        try {
            const item = this.approvedState[
                Math.floor(Math.random() * this.approvedState.length)
                ];
            this.approvedState.splice(this.approvedState.indexOf(item), 1);
            this.setCurrMsg(item.msg);
        } catch (err) {
            this.setCurrMsg('No approved state messages');
            console.log(err);
        }
    }

    // Repeat the three above functions but with tauntArr
    public deleteTauntItem(user: string, msg: string) {
        this.tauntArr.forEach((item) => {
            if (item.user === user && item.msg === msg) {
                this.tauntArr.splice(this.tauntArr.indexOf(item), 1);
            }
        });
    }

    public approveTauntItem(user: string, msg: string) {
        this.approvedTaunt.push({ user: user, msg: msg });
        this.deleteTauntItem(user, msg);
    }

    public getRandomTaunt() {
        try {
            const item = this.approvedTaunt[
                Math.floor(Math.random() * this.approvedTaunt.length)
                ];
            this.approvedTaunt.splice(this.approvedTaunt.indexOf(item), 1);
            this.setCurrMsg(item.msg);
        } catch (err) {
            this.setCurrMsg('No approved taunt messages');
            console.log(err);
        }
    }

    // Repeat the three above functions but with questionArr
    public deleteQuestionItem(user: string, msg: string) {
        this.questionArr.forEach((item) => {
            if (item.user === user && item.msg === msg) {
                this.questionArr.splice(this.questionArr.indexOf(item), 1);
            }
        });
    }

    public approveQuestionItem(user: string, msg: string) {
        this.approvedQuestion.push({ user: user, msg: msg });
        this.deleteQuestionItem(user, msg);
    }

    public getRandomQuestion() {
        try {
            const item = this.approvedQuestion[
                Math.floor(Math.random() * this.approvedQuestion.length)
                ];
            this.approvedQuestion.splice(this.approvedQuestion.indexOf(item), 1);
            this.setCurrMsg(item.msg);
        } catch (err) {
            this.setCurrMsg('No approved question messages');
            console.log(err);
        }
    }
}

export default Bot;
