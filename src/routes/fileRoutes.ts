//Import node modules
import express from "express";
import { ObjectId } from "mongodb";
import multer from "multer";
import fs from "fs";

//Import connection
import MongoConnection from "../configs/db.config.js";

//Import note model
import File from "../models/file.js";

//Import controllers
import { addFile, getFilesByParentId } from "../controllers/fileControllers.js";

const fileRoutes = express();
const upload = multer({ dest: "uploads/" });
let db = MongoConnection.db("Zespolowka");

fileRoutes.post(
  "/files",
  upload.array("uploadedFiles"),
  async (req, res) => {
    try {
      let parentId = req.body.parentId;
      let files: any = req.files;
      for (let postedFile of files) {
        let file = fs.readFileSync(postedFile.path);
        let encodedFile = file.toString("base64");
        let newFile = {
          parent: parentId,
          content: {
            contentType: postedFile.mimetype,
            data: new Buffer(encodedFile, "base64"),
          },
        };
        let result = await addFile(newFile, db);

        //add file id to note model as miniature
        if(postedFile === files[0]){
          await db.collection("notes").updateOne({ _id: new ObjectId(parentId) }, { $set: { miniature: result.insertedId } });
        }

        fs.unlink(postedFile.path, (err) => {
          if (err) {
            console.error(err)
          }
        });
        if (!result) {
          res.status(500).send("File insert error");
        }
      }
      res.status(201).send("OK");
    } catch (error) {
      console.error(error);
      res.status(400).send("ERROR");
    }
  }
);

fileRoutes.get("/files/:_id", async(req, res) => {
  if(req.params._id == undefined){
    res.status(404).send("Brak miniaturki");
  }
  else{
    let result = await db.collection("files").findOne({_id: new ObjectId(req.params._id)});
    console.log(result);
    result ? res.status(200).send(result) : res.status(404).send("Not found");
  }
});

export default fileRoutes;
