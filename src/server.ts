//Import node modules
import express from "express";

//Import config
import MongoConnection, {connectToCluster} from "./configs/db.config.js";

//Import utils
import {exitHandler} from "./utils/exitHandler.js";

//Import routes
import userRoutes from "./routes/userRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import creditCardRoutes from "./routes/creditCardRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

//Server basic config
const app = express();
// @ts-ignore
const port: number = +process.env.PORT || 8080;
const host = process.env.YOUR_HOST || '0.0.0.0';
app.use(express.json());

//Catch express errors ex. bad type, not get json etc.
app.use((err: any, req: any, res: any, next: any) => {
    if (err.status == 400 && "body" in err) {
        console.error(err);
        return res.status(400).send("Something went wrong."); // Bad request
    }
    next();
});

//Catch ctrl + c event
process.stdin.resume();
process.on(
    "SIGINT",
    exitHandler.bind(null, MongoConnection, {log: true, exit: true})
);

//Create connection to MongoDB Atlas cluster
await connectToCluster();

//App routess
app.use("/", userRoutes);
app.use("/", noteRoutes);
app.use("/", fileRoutes);
app.use("/", creditCardRoutes);
app.use("/", orderRoutes);
app.use("/", commentRoutes);
app.use("/", reportRoutes);

//Port info
app.listen(port, host, () =>
    console.log(`API server listening on port: ${port}!`)
);
