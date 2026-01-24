const express = require("express");
const app = express();
const user = require("./Models/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const AuthRouter = require("./Routes/AuthRouter");
const ApiRouter = require("./Routes/ApiRouter");
const http = require("http");
const initializeSocket = require("./Controllers/Socket/socket");
const cookieParser = require("cookie-parser");
const profileRouter = require("./Routes/profileRoutes");
const connectionRoute = require("./Routes/connectionRoute");
const sendGridMail = require("./utils/SendGridMail");
const LoggedInOnly = require("./Middlewares/LoggedInOnly");
const chatRoute = require("./Routes/chatRouter");
const compression = require("compression");
const ContributionRouter = require("./Routes/ContributionsRouter");
const { connectRedis } = require("./utils/client");

const server = http.createServer(app);
initializeSocket(server);
connectRedis();
app.use(
  cors({
    origin: ["https://skillmate-plum.vercel.app", "http://localhost:5173"],
    credentials: true,
  }),
);
app.use(cookieParser());
require("dotenv").config();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(compression());
const PORT = process.env.PORT;

app.get("/ping", (req, res) => {
  res.send("PONG");
});
app.get("/", (req, res) => {
  res.send("Hello World!!!");
});
app.get("/sendemail", async (req, res) => {
  const otp = 280306; // or generate dynamically
  const result = await sendGridMail(otp, "bhattaa@rknec.edu");
  console.log("SENDGRID_API_KEY from env:", process.env.SENDGRID_API_KEY);

  res.json(result);
});

app.use(bodyParser.json());

app.use("/auth", AuthRouter);
app.use("/api", ApiRouter);
app.use("/profile", profileRouter);
app.use("/connection", connectionRoute);
app.use("/chat", LoggedInOnly, chatRoute);
app.use("/contribution", ContributionRouter);

server.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
