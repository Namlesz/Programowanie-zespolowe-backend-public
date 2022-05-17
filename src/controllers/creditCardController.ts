import CreditCard from "../models/creditCard.js";
import {Db, ObjectId} from "mongodb";

//Add credit card to database
export const addCreditCard = async (
    _id: string,
    creditCard: CreditCard,
    database: Db
) =>
    database
        .collection("users")
        .updateOne(
            {_id: new ObjectId(_id)},
            {$push: {creditCards: {creditCard: creditCard}}}
        )
        .then((res) => res.matchedCount != 0);

//Return all user cards
export const getAllUserCards = async (_id: string, database: Db) =>
    database
        .collection("users")
        .findOne(
            {_id: new ObjectId(_id)},
            {projection: {creditCards: {creditCard: {card_number: 1}}, _id: 0}}
        )
        .then((res) => {
            if (res && "creditCards" in res && res.creditCards.length > 0) return res;
            else return null;
        });

//Get one card by user_id and card number
export const getOneCard = async (
    _id: string,
    card_number: string,
    database: Db
) =>
    database
        .collection("users")
        .findOne(
            {
                $and: [
                    {"creditCards.creditCard.card_number": card_number},
                    {_id: new ObjectId(_id)},
                ],
            },
        )
        .then((res) => {
            if (res) return res.creditCards[0];
            else return null;
        });

export const removeCardData = async (
    _id: string,
    card_number: string,
    database: Db
) =>
    database
        .collection("users")
        .updateOne(
            {
                $and: [
                    {"creditCards.creditCard.card_number": card_number},
                    {_id: new ObjectId(_id)},
                ],
            },
            {$pull: {creditCards: {"creditCard.card_number": card_number}}}
        )
        .then((res) => res.matchedCount != 0);
