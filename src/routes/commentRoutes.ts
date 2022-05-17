//Import node modules
import express from "express";
import { ObjectId } from "mongodb";

//Import connection
import MongoConnection from "../configs/db.config.js";

//Import comment model
import Comment from "../models/comment.js";

//Import controllers
import { addComment, getAllCommentsOfNote } from "../controllers/commentController.js";

const commentRoutes = express();
let db = MongoConnection.db("Zespolowka");

commentRoutes.post("/note/comments", async (req, res) => {
    try {
      req.body.creationDate = Date.now();
      req.body.noteId =  new ObjectId(req.body.noteId);
      let newComment: Comment = req.body as Comment;
      let result = await addComment(newComment, db);
      result
        ? res.status(200).send(result)
        : res.status(500).send("Note insert error");
    } catch (error) {
      console.error(error);
      res.status(400).send("ERROR");
      return;
    }
});

commentRoutes.get("/note/comments/:_id", async (req, res) => {
  try {
      let result = await getAllCommentsOfNote(new ObjectId(req.params._id), db);
      result ? res.status(200).send(result) : res.status(500).send("Couldn't get comments");
  } catch (error) {
    console.error(error);
    res.status(400).send("ERROR");
    return;
  }
});

export default commentRoutes;