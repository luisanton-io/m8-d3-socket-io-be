import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"

const app = express();
const server = createServer(app);
const io = new Server(server, { allowEIO3: true });

app.use(cors())

let onlineUsers = []

io.on("connection", socket => {
    console.log(socket.id)

    socket.join("main-room")
    console.log(socket.rooms)

    socket.on("setUsername", ({ username }) => {
        console.log("here")
        onlineUsers =
            onlineUsers
                .filter(user => user.username !== username)
                .concat({
                    username,
                    id: socket.id
                })
        console.log(onlineUsers)

        socket.emit("loggedin")

        socket.broadcast.emit("newConnection")

    })

    socket.on("sendmessage", message => {
        // io.sockets.in("main-room").emit("message", message)
        socket.to("main-room").emit("message", message)

        // saveMessageToDb(message)
    })

    socket.on("disconnect", () => {
        console.log("Disconnected socket with id " + socket.id)

        onlineUsers = onlineUsers.filter(user => user.id !== socket.id)

        socket.broadcast.emit("newConnection")

    })

});

app.get("/online-users", (req, res) => {
    res.send({ onlineUsers })
})

server.listen(3030, () => {
    console.log("Server listening on port 3030")
});
