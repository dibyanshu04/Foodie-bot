const express = require("express");
const cors = require("cors");
// bot framework imports
const { BotFrameworkAdapter } = require("botbuilder");
const RestaurantBot = require("./bot/Restaurantbot");

// API routes
const productRoutes = require("./src/routes/productRoutes");
const restaurantRoutes = require("./src/routes/restaurantRoutes");
const reservationRoutes = require("./src/routes/reservationRoutes");
const userRoutes = require("./src/routes/userRoutes");
const orderRoutes = require("./src/routes/orderRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/product", productRoutes); //it is a middleware
app.use("/restaurant", restaurantRoutes);
app.use("/reservation", reservationRoutes);
app.use("/user", userRoutes);
app.use("/order", orderRoutes);

app.get("/", (req, res) => {
  res.send("Hello from Restaurant Bot Backend");
});

// Bot Framework endpoint
const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID || "",
  appPassword: process.env.MICROSOFT_APP_PASSWORD || "",
});
adapter.onTurnError = async (context, error) => {
  console.error("Bot Error:", error);
  await context.sendActivity("😞 Sorry, something went wrong.");
};

const bot = new RestaurantBot();
app.post("/api/messages", (req, res) =>
  adapter.processActivity(req, res, (ctx) => bot.run(ctx))
);

module.exports = app;
