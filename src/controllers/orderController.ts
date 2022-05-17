import {Db, ObjectId} from "mongodb";
import fetch from "node-fetch";
import {getPushTokenOfUser} from "./userControllers.js";

export const buyNote = async (
    userId: String,
    noteId: string,
    price: number,
    database: Db
) => {
    await database.collection("orders").insertOne({
        userId: userId,
        noteId: noteId,
        date: Date.now(),
        price: price,
    });

    let note = await database.collection("notes").findOne({_id: new ObjectId(noteId)}, {projection: {authorId: 1, title: 1}});
    console.log(note);
    if(note!=null){
        let authorToken = await getPushTokenOfUser(note.authorId, database);
        console.log(authorToken);

        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'host': "exp.host",
                'accept': 'application/json',
                'accept-encoding': 'gzip, deflate',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                "to": authorToken,
                "title": "Ktoś kupił Twoją notatkę!",
                "body": "Notatka " + note.title + " została kupiona."
            })
        }).then((response) => {
            console.log(response.status);
            console.log(response.text);
        }).catch((error) => console.log(error));
    }
};

export const isNoteExist = async (noteId: string, database: Db) =>
    await database
        .collection("notes")
        .countDocuments({_id: new ObjectId(noteId)}, {limit: 1})
        .then((res) => res == 1);

export const getNotePrice = async (noteId: string, database: Db) =>
    await database
        .collection("notes")
        .findOne(
            {_id: new ObjectId(noteId)},
            {projection: {price: 1, _id: 0}}
        )
        .then((res) => {
            if (res) {
                return +res.price;
            } else return -1;
        });

export const isOrderExist = async (
    userId: string,
    noteId: string,
    database: Db
) =>
    await database
        .collection("orders")
        .countDocuments(
            {
                $and: [{userId: userId}, {noteId: noteId}],
            },
            {limit: 1}
        )
        .then((res) => res == 1);

export const listBoughtNotes = async (userId: string, database: Db) =>
    await database
        .collection("orders")
        .aggregate([
            {
                $match: {
                    userId: userId
                }
            },
            {
                "$project": {
                    "noteId": {
                        "$toObjectId": "$noteId"
                    }
                }
            },
            {
                $lookup: {
                    from: "notes",
                    localField: "noteId",
                    foreignField: "_id",
                    as: "noteInfo",
                },
            },
            {
                $unwind: "$noteInfo"
            },
            {
                $project: {
                    _id: 0,
                    noteId: 1,
                    title: "$noteInfo.title",
                    authorName: "$noteInfo.authorName",
                    authorSurname: "$noteInfo.authorSurname",
                    year: "$noteInfo.year"
                }
            }

        ])
        .toArray();

export const IdChecker = async (userId: string, noteId: string, res: any, db: Db) => {
    if (noteId.length != 24 || !(await isNoteExist(noteId, db))) {
        res.status(404).send("Note not found");
        return;
    }

    if (userId == null || userId.length != 24) {
        res.status(404).send("Wrong user id");
        return;
    }
}
