const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
const port = process.env.PORT || 5000;
const cors= require("cors");
app.use(cors());

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})


app.get('/', (req, res) => {
    res.send('server is running');
})


io.on("connection", (socket) => {

    
    socket.emit("me", socket.id)

    socket.on("disconnect", () => {
        socket.broadcast.emit("callEnded")
    })

    socket.on("callUser", (data) => {
        io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
    })

    socket.on("answerCall", (data) => {
        io.to(data.to).emit("callAccepted", data.signal)
    })

    socket.on("send message", (data) => {
        io.to(data.to).emit("message", data)
        io.to(data.from).emit("message", data)
    })

    socket.on("connection request", (data) => {
        io.to(data.id).emit("connection",data.from);
    })

    socket.on("connection success", (data) => {
        io.to(data.id).emit("success", data.from);
    })

    socket.on("on_disconnect", (id) => {
      io.to(id).emit("userDisconnected", id);
    });

    socket.on("on_leave", (id) => {
      io.to(id).emit("userLeft", id);
    });

})

server.listen(port, () => console.log(`server is running on port `));

