import {Db, ObjectId} from "mongodb";
import User, {mapToUser} from "../models/user.js";
import generatePassword, {saltRounds} from "../middlewares/passwordGenerator.js";
import sendMail from "../middlewares/emailSender.js";
import bcrypt from "bcrypt";

//Check if email already exists in database
export const verifyRegistrationData = async (user: User, database: Db) =>
    await database.collection("users").findOne({email: user.email});

//Check if email has correct syntax
export const verifyEmailFormat = (email: string) => /\S+@\S+\.\S+/.test(email);

//Find by id or email and check if password is correct
export const getAccount = async (user: User, database: Db) =>
    await database.collection("users").findOne(
        {
            $or: [{_id: new ObjectId(user._id)}, {email: user.email}],
        },
        {
            projection: {password: 1}
        },
    );

//Get user account avatar
export const getAvatarOfUser = async (
    id: string,
    database: Db
): Promise<User["avatar"] | null> =>
    await database
        .collection("users")
        .findOne({_id: new ObjectId(id)})
        .then((res) => {
            if (res) {
                let user: User = mapToUser(res);
                return user.avatar;
            } else return null;
        });

//Get user info by ID
export const getUserInfo = async (
    id: string,
    database: Db
): Promise<User | null> =>
    await database
        .collection("users")
        .findOne(
            {_id: new ObjectId(id)},
            {projection: {password: 0, bank_account: 0}}
        )
        .then((res) => {
            if (res) {
                return mapToUser(res);
            } else return null;
        });

//Get account bank number of user by id
export const getBankAccountNumber = async (id: string, database: Db) =>
    await database
        .collection("users")
        .findOne(
            {_id: new ObjectId(id)},
            {projection: {bank_account: 1, _id: 0}}
        )
        .then((res) => {
            if (res && "bank_account" in res) {
                return res.bank_account;
            } else return null;
        });

//Change user avatar
export const changeUserAvatar = async (
    id: string,
    database: Db,
    image: User["avatar"]
) =>
    await database
        .collection("users")
        .updateOne({_id: new ObjectId(id)}, {$set: {avatar: image}})
        .then((res) => res.matchedCount != 0);

//Change password by id
export const changePassword = async (data: any, database: Db) =>
    await database
        .collection("users")
        .updateOne(
            {_id: new ObjectId(data._id)},
            {$set: {password: data.newPassword}}
        )
        .then((res) => res.matchedCount != 0);

export async function changeUserData(user: User, database: Db) {
    let id = user._id;
    delete user._id;
    delete user.email;
    delete user.password;
    return await database
        .collection("users")
        .updateOne({_id: new ObjectId(id)}, {$set: user})
        .then((res) => res.matchedCount != 0);
}

export async function resetPassword(email: string, database: Db) {
    let newPassword = generatePassword(8);
    let hash = bcrypt.hashSync(newPassword, saltRounds)
    let res = await database
        .collection("users")
        .updateOne({email: email}, {$set: {password: hash}});

    if (res.matchedCount == 0) {
        return false;
    }
    try {
        await sendMail(email, newPassword);
        return true;
    } catch (err) {
        return false;
    }
}

export async function getRatingOfUser(userId: string, database: Db){
    let result = await database.collection("notes").aggregate([
        { $match: { authorId: new ObjectId(userId) } },
        { $group: { _id: "$authorId", userRating: { $avg: "$rating" } } }
    ]).toArray();

    return result;
}

export async function getPushTokenOfUser(userId: ObjectId, database: Db){
    let result =  await database.collection("users").findOne( {_id: userId },
    {projection: { expoPushNotificationsToken: 1 }});

    if(result!=null){
        return result.expoPushNotificationsToken;
    }
    return;
}

export function verifyBankAccountNumber(accountNumber: string){
    let numeric = accountNumber.replace(/\D/g,'');
    numeric = numeric.substring(2) + "2521" + numeric.substring(0, 2);
    
    while(numeric.length>=4){
        let number = numeric.substring(0, 4);
        let remainder = parseInt(number)%97;
        numeric = remainder.toString() + numeric.substring(4);
    }

    if(parseInt(numeric)%97 == 1) return true;
    else return false;
}