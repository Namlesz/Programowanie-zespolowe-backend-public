//Import node modules
import express from "express";
import { ObjectId } from "mongodb";

//Import connection
import MongoConnection from "../configs/db.config.js";

//Import note model
import Note from "../models/note.js";

//Import controllers
import {
  addNote,
  getAllNotesPreview,
  getNote,
  getNoteMiniature,
  getNotePreviewData,
  updateNoteDescription,
  convertToNote,
  getNotesPreviewByTitle,
  getLastNotesAddedByUser,
  getLastNotesBoughtByUser,
} from "../controllers/noteControllers.js";
import { getFilesByParentId } from "../controllers/fileControllers.js";

const noteRoutes = express();
let db = MongoConnection.db("Zespolowka");

noteRoutes.post("/note", async (req, res) => {
  try {
    req.body.creationDate = Date.now();
    req.body.authorId = new ObjectId(req.body.authorId);
    req.body.numberOfComments = 0;
    req.body.rating = 0;
    let newNote: Note = req.body as Note;
    let result = await addNote(newNote, db);
    result
      ? res.status(200).send(result)
      : res.status(500).send("Note insert error");
  } catch (error) {
    console.error(error);
    res.status(400).send("ERROR");
    return;
  }
});

noteRoutes.get("/note/:_id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params._id)) {
      res.status(500).send("Incorrect ID");
      return;
    }
    let noteId = req.params._id;
    let noteFiles = await getFilesByParentId(noteId, db);
    let noteData = await getNote(noteId, db);
    
    let result = {
      files: noteFiles,
      data: noteData,
    };

    noteId != null
      ? res.status(201).send(result)
      : res.status(404).send("Wrong ID");
  } catch (error) {
    console.error(error);
    res.status(400).send("ERROR");
  }
});

noteRoutes.get("/note/preview/:_id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params._id)) {
      res.status(500).send("Incorrect ID");
      return;
    }
    let noteId = req.params._id;
    let noteData = await getNotePreviewData(noteId, db);
    if(noteData){
      let noteMiniatureBase64 = await getNoteMiniature(noteData.miniature, db);
      noteData.miniatureBase64 = noteMiniatureBase64;
    }
    
    noteData != null
      ? res.status(201).send(noteData)
      : res.status(404).send("Wrong ID");
  } catch (error) {
    console.error(error);
    res.status(400).send("ERROR");
  }
});

noteRoutes.post("/updateNoteDescription", async (req, res) => {
  try {
    let result = await updateNoteDescription(req.body._id, req.body.description, db);
    result
    ? res.status(200).send("Updated description")
    : res.status(500).send("Error");
  } catch (error) {
    res.status(400).send("ERROR");
  }
});

noteRoutes.post("/getAllNotesInfo", async (req, res) => {
  try {
    let result = await getAllNotesPreview(req.body, db);
    result ? res.status(200).send(result) : res.status(500).send("Error");
  } catch (error) {
    res.status(400).send("ERROR");
  }
});

noteRoutes.post("/getNotesPreviewByTitle", async (req, res) => {
  try {
    let result = await getNotesPreviewByTitle(req.body.title, db);
    result ? res.status(200).send(result) : res.status(500).send("Error");
  } catch (error) {
    res.status(400).send("ERROR");
  }
});

noteRoutes.post("/getLastAddedNotes", async (req, res) => {
  try {
    let result = await getLastNotesAddedByUser(req.body.userId, req.body.n, db);
    result ? res.status(200).send(result) : res.status(500).send("Error");
  } catch (error) {
    res.status(400).send("ERROR");
  }
});

noteRoutes.post("/getLastBoughtNotes", async (req, res) => {
 try {
    let result = await getLastNotesBoughtByUser(req.body.userId, req.body.n, db);
    result ? res.status(200).send(result) : res.status(500).send("Error");
 } catch (error) {
   res.status(400).send("ERROR");
 }
});

noteRoutes.delete("/note/:_id", async (req, res) => {
  let noteId = req.params._id;

  try {
    db.collection("notes").deleteOne( { "_id" : new ObjectId(noteId) } );
    res.status(202).send("Success");
  } catch (error) {
    res.status(400).send("error");
  }
});
export default noteRoutes;
