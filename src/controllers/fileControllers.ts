import { Db } from "mongodb";
import File from "../models/file.js";

export const addFile = async (data: File, database: Db) =>
  await database.collection("files").insertOne(data);

export const getFilesByParentId = async (parentId: string, database: Db) =>
  await database.collection("files").find({ parent: parentId }).project({ parent: 0, content: 0}).toArray();
