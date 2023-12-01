
import config from './config';
import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
//import crons from "./services/Crons" 

// routes
import router from "./routes";
// create your server here with express
const app = express();
app.use(morgan("dev")); 
app.use(cors());
app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ extended: true, limit: "100mb", extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "private")));

// run server
app.use("/api", router);
app.set("port", config.PORT, config.HOST);
const server = app.listen(app.get("port"), () => {
  console.log("Run mode:", process.env.NODE_ENV, "\nServer running in port --> ", app.get("port"));
});

server.timeout = 600000;