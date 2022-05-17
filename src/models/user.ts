import { ObjectId } from "mongodb";
import CreditCard from "./creditCard";

//User model
interface User {
  _id?: ObjectId;
  nickname?: string;
  password?: string;
  name?: string;
  surname?: string;
  email?: string;
  school?: string;
  major?: string;
  bank_account?: string;
  avatar?: {
    contentType: string;
    image: Buffer;
  };
  creditCard?: CreditCard[];
  rating?: number;
  commentsAboutUser?: number;
  expoPushNotificationsToken?: string;
}

let userFields = [
  "_id",
  "nickname",
  "password",
  "name",
  "surname",
  "email",
  "major",
  "school",
  "bank_account",
  "avatar",
  "rating",
  "commentsAboutUser",
  "expoPushNotificationsToken"
];

//Check if JSON have required field
export function isUser(json: any): json is User {
  return (
    "password" in json && "name" in json && "surname" in json && "email" in json
  );
}

//Convert JSON to User model
export function mapToUser(json: any): User {
  let _user: any = {};
  for (let name of userFields) {
    if (name in json) _user[name] = json[name];
  }
  return _user as User;
}
export default User;
