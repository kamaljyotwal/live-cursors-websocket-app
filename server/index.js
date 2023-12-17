const http = require("http")
const { WebSocketServer } = require("ws")
const { v4: uuidv4 } = require('uuid');

const server = http.createServer()
const wsServer = new WebSocketServer({ server })
const PORT = 8000;
const url = require("url")

const users = {};
const connections = {};

const broadcast = () => {
    Object.keys(connections).forEach(uuid => {
        const connection = connections[uuid]
        const message = JSON.stringify(users)
        console.log(message)
        connection.send(message)
    })

}
function handleMsg(message, uuid) {
    const msg = JSON.parse(message.toString())
    const user = users[uuid]
    user.state = msg
    broadcast()
}
const handleClose = (uuid) => {
    console.log(`${users[uuid].username} disconnected`)
    delete connections[uuid];
    delete users[uuid]
    broadcast()
}

wsServer.on("connection", (connection, req) => {
    const uuid = uuidv4()
    connections[uuid] = connection
    const { username } = url.parse(req.url, true).query
    console.log(`${username} connected`)
    users[uuid] = {
        username: username,
        state: {
            x: 0,
            y: 0
        }
    }
    connection.on("message", message => handleMsg(message, uuid));
    connection.on("close", () => handleClose(uuid))
})

server.listen(PORT, () => {
    console.log(`WS server listening on ${PORT}`)
})




