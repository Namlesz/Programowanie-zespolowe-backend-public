import {Db, ObjectId} from "mongodb";
import Comment from "../models/comment.js";

export const addComment = async (comment: Comment, database: Db) => {
    let result = await database.collection("comments").insertOne(comment);
    let noteId = comment.noteId;
    let note = await database.collection("notes").findOne(
        { _id: new ObjectId(noteId) }
    );
    
    if(note!=null){
        //increases note number of comments by 1 and updates its average rating
        let newRating = ((note.rating*note.numberOfComments)+comment.rating)/(note.numberOfComments+1);
        await database.collection("notes").updateOne(
            { _id: new ObjectId(noteId) },
            { $set : { rating: newRating, numberOfComments: note.numberOfComments+1 } }
        );
        let user = await database.collection("users").findOne(
            { _id: new ObjectId(note.authorId)}
        );
        if(user!=null){
            let userNewRating = ((user.rating*user.commentsAboutUser)+comment.rating)/(user.commentsAboutUser+1);
            await database.collection("users").updateOne(
                { _id: new ObjectId(user._id) },
                { $set : { rating: userNewRating, commentsAboutUser: user.commentsAboutUser+1 } }
            );
        }
    }
    return result;
};

export const getAllCommentsOfNote = async (noteId: ObjectId, database: Db) => {
    let result = await database.collection("comments").find({ noteId: noteId }).toArray();
    return result;
};
