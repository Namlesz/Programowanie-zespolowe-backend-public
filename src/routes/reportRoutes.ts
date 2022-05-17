//Import node modules
import express from "express";

//Import connection
import MongoConnection from "../configs/db.config.js";
import {appReport, noteReport, toAppReport, toNoteReport} from "../models/reports.js";
import {insertAppReport, insertNoteReport} from "../controllers/reportsController.js";
import {isNoteExist} from "../controllers/orderController.js";

const reportRoutes = express();
let db = MongoConnection.db("Zespolowka");

reportRoutes.post("/report/app", async (req, res) => {
    let appReport: appReport | null = toAppReport(req.body);
    if (appReport == null)
        res.status(423).send("Bad report");
    else {
        appReport.timestamp = new Date().toLocaleDateString();

        await insertAppReport(appReport, db) ?
            res.status(201).send("Reported app") :
            res.status(404).send("Error reporting app");
    }
})

reportRoutes.post("/report/note", async (req, res) => {
    let noteReport: noteReport | null = toNoteReport(req.body);

    if (noteReport == null || noteReport.noteId.length != 24 || !(await isNoteExist(noteReport.noteId, db)))
        res.status(423).send("Bad report");
    else {
        await insertNoteReport(noteReport, db) ?
            res.status(201).send("Reported note") :
            res.status(404).send("Error reporting note");
    }
})
export default reportRoutes;