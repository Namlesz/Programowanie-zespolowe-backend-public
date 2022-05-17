import {Db, ObjectId} from "mongodb";
import {appReport, noteReport} from "../models/reports.js";

export const insertAppReport = async (report: appReport, database: Db) =>
    await database.collection("app_reports").insertOne(report);

export const insertNoteReport = async (report: noteReport, database: Db) =>
    await database.collection("note_reports").insertOne(report);