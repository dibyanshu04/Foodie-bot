require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./utils/db");
const Socket = require("socket.io");
const {initializeSocket} = require("./socket");


const server = http.createServer(app);

const io = Socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

connectDB();

initializeSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
