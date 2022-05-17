import { ObjectId } from "mongodb";

interface Note {
  _id?: ObjectId;
  title: string;
  school?: string;
  year: number;
  subject: string;
  rating: number;
  major: string;
  price: number;
  creationDate: Date;
  authorId: ObjectId;
  authorName: string;
  authorSurname: string;
  numberOfPages: number;
  description: string;
  tags: string[];
  
  //ID of file that will be used as miniature
  miniature: ObjectId;
  numberOfComments: number;
}
export default Note;
