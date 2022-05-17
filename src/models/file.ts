import { ObjectId } from "mongodb";

interface File {
  _id?: ObjectId;
  parent: ObjectId;
  content: {
    contentType: string;
    data: Buffer;
  };
}
export default File;
