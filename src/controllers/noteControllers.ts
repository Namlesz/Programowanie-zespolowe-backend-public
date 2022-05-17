import {Db, ObjectId} from "mongodb";
import Note from "../models/note.js";

//Get note by its ID
export const getNote = async (_id: string, database: Db) =>
  await database.collection("notes").findOne({ _id: new ObjectId(_id) });

export const getNotePreviewData = async(_id: string, database: Db) =>
  await database.collection("notes").findOne(
  { _id: new ObjectId(_id) }, 
  { projection: 
    { title: 1, 
      authorName: 1,
      authorSurname: 1,
      rating: 1,
      year: 1,
      price: 1,
      miniature: 1
    }
  });

export const getNoteMiniature = async (miniatureId: string, database: Db) => {
    return await database.collection("files").findOne({_id: new ObjectId(miniatureId)});
}

export const addNote = async (data: Note, database: Db) =>
  await database.collection("notes").insertOne(data);

export const getAllNotesPreview = async (query: Object, database: Db) => {
    return await database.collection("notes").find(
        query,
        {
            projection:
                {
                    title: 1,
                    authorName: 1,
                    authorSurname: 1,
                    rating: 1,
                    year: 1,
                    price: 1,
                    miniature: 1
                }
        }).toArray();
  }

export const getNotesPreviewByTitle = async (title: String, database: Db) => {
  let result = await database.collection("notes").find(
    {
      title: {$regex: title, 
              $options: 'i'}
    },
    { projection: 
      { title: 1, 
        authorName: 1,
        authorSurname: 1,
        rating: 1,
        year: 1,
        price: 1,
        miniature: 1
      }
    }).toArray();
    return result;
}

export const updateNoteDescription = async (id: string, newDescription: string, database: Db) => {
  let result = await database.collection("notes").updateOne({ _id: new ObjectId(id) }, { $set: { description: newDescription } });
  return result.modifiedCount!=0;
}

export const getLastNotesAddedByUser = async (userId: string, n: number, database: Db) => {
  let result = await database.collection("notes").find(
    {
      authorId: new ObjectId(userId)
    }
  ).sort({creationDate:-1}).limit(n).toArray();
  return result;
}

export const getLastNotesBoughtByUser = async (userId: string, n: number, database: Db) => {
  let result = await database
  .collection("orders")
  .aggregate([
      {
          $match: {
              userId: userId
          }
      },
      { $sort : { date : -1 } },
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
              year: "$noteInfo.year",
              rating: "$noteInfo.rating"
          }
      }

  ])
  .limit(n).toArray();
  return result;
}

export function convertToNote(data: Note): Note {
  let newNote: any = {};
  if (data._id) newNote._id = data._id;
  if (data.title) newNote.title = data.title;
  if (data.school) newNote.school = data.school;
  if (data.year) newNote.year = data.year;
  if (data.subject) newNote.subject = data.subject;
  if (data.major) newNote.major = data.major;
  if (data.price) newNote.price = data.price;
  if (data.rating) newNote.rating = data.rating;
  if (data.creationDate) newNote.creationDate = data.creationDate;
  if (data.authorId) newNote.authorId = data.authorId;
  if (data.authorName) newNote.authorName = data.authorName;
  if (data.authorSurname) newNote.authorSurname = data.authorSurname;
  if (data.numberOfPages) newNote.numberOfPages = data.numberOfPages;
  if (data.description) newNote.description = data.description;
  if (data.tags) newNote.tags = data.tags;
  if (data.miniature) newNote.miniature = data.miniature;

  return newNote;
}
