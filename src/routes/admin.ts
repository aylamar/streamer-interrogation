import express from "express";
import path from "path";

const router = express.Router();

router.get("/", (req, res) => {
    const reject = () => {
        res.setHeader('www-authenticate', 'Basic')
        res.sendStatus(401)
    }

    const authorization = req.headers.authorization

    if(!authorization) {
        return reject()
    }

    const [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString().split(':')

    let user = process.env.LOGIN_USER
    let pass = process.env.LOGIN_PASS

    if(! (username === user && password === pass)) return reject()

    res.sendFile(path.join(__dirname, "../../public/admin.html"));
});

export default router;