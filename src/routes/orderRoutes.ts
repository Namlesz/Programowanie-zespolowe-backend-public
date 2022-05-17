//Import node modules
import express from "express";

//Import connection
import MongoConnection from "../configs/db.config.js";
import {
    buyNote,
    getNotePrice, IdChecker,
    isOrderExist,
    listBoughtNotes,
} from "../controllers/orderController.js";

const orderRoutes = express();
let db = MongoConnection.db("Zespolowka");

orderRoutes.post("/buyNote", async (req, res) => {
    let userId: string = req.body.userId,
        noteId: string = req.body.noteId;

    await IdChecker(userId, noteId, res, db);

    if (await isOrderExist(userId, noteId, db)) {
        res.status(404).send("Note already bought");
        return;
    }

    let price: number = await getNotePrice(noteId, db);
    if (price <= 0) {
        res.status(500).send("Something went wrong");
        return;
    }

    (await buyNote(userId, noteId, price, db)) == null
        ? res.status(201).send("OK")
        : res.status(500).send("Insert error");
});

orderRoutes.post("/isBought", async (req, res) => {
    let userId: string = req.body.userId,
        noteId: string = req.body.noteId;

    await IdChecker(userId, noteId, res, db);

    (await isOrderExist(userId, noteId, db))
        ? res.status(201).send("Bought item")
        : res.status(420).send("Not found");
});

orderRoutes.post("/listBoughtNotes", async (req, res) => {
    let userId: string = req.body.userId;

    if (userId == null || userId.length != 24) {
        res.status(404).send("Wrong user id");
        return;
    }

    let result = await listBoughtNotes(userId, db);
    result.length > 0 ? res.status(201).send(result) : res.status(420).send("Empty");
});

export default orderRoutes;
