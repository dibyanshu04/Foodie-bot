require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./utils/db");
const Socket = require("socket.io");
const initSocket = require("./socket");


const server = http.createServer(app);

const io = Socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

connectDB();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  initSocket(io, socket);
});



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
