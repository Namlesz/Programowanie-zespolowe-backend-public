import {ObjectId} from "mongodb";

interface Comment {
    authorName: String,
    authorSurname: String,
    noteId: ObjectId,
    creationDate: Date,
    content: String,
    rating: number
}

export default Comment;