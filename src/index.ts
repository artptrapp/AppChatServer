import express from 'express';
import log4js from 'log4js';
import bodyParser from 'body-parser';
import io, { Server } from 'socket.io';
import http from 'http'
import SocketConnectionHandler from './socket/ConnectionHandler';

const app = express();
const port = process.env.PORT || 3000;
const httpServer = http.createServer(app);
const socketServer = new Server(httpServer)

log4js.configure({
    appenders: {
        errorAppender: { type: "file", filename: "errors.log" },
        defaultAppender: { type: "file", filename: "default.log" }
    },
    categories: {
        error: {
            appenders: ["errorAppender"],
            level: "error"
        },
        default: {
            appenders: ["defaultAppender"],
            level: "debug"
        }
    }
})

const socketConnectionHandler = new SocketConnectionHandler(socketServer);

app.use(bodyParser.json())

app.get("/health-check", function (req, res) {
    res.status(200).json({
        ok: true,
        uptime: process.uptime()
    })
});

app.get('/socket-test', (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

httpServer.listen(port, function () {
    console.log(`App is listening on port ${port}..`);
});
