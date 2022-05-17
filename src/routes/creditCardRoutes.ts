//Import node modules
import express from "express";

//Import models
import CreditCard, {
  isCreditCard,
  mapToCreditCard,
  validCreditCardNumber,
} from "../models/creditCard.js";

//Import controller
import {
  addCreditCard,
  getAllUserCards,
  getOneCard,
  removeCardData,
} from "../controllers/creditCardController.js";

//Import connection
import MongoConnection from "../configs/db.config.js";
import creditCard from "../models/creditCard.js";

const creditCardRoutes = express();
let db = MongoConnection.db("Zespolowka");

creditCardRoutes.post("/creditCards", async (req, res) => {
  const _id: string = req.body._id;
  let creditCard: CreditCard;

  //Check required fields
  if (isCreditCard(req.body)) creditCard = mapToCreditCard(req.body);
  else {
    res.status(400).send("Bad data");
    return;
  }

  //Check if card credit number is correct
  if (!validCreditCardNumber(creditCard.card_number)) {
    res.status(421).send("Wrong card number");
    return;
  }

  //Check if card already exits in database
  if (await getOneCard(_id, creditCard.card_number, db)) {
    res.status(422).send("Card already exists");
    return;
  }

  //Try to insert to database
  (await addCreditCard(_id, creditCard, db))
    ? res.status(201).send("OK")
    : res.status(400).send("Something went wrong");
});

creditCardRoutes.get("/creditCards/:_id", async (req, res) => {
  let result = await getAllUserCards(req.params._id, db);
  result != null
    ? res.status(201).send(result)
    : res.status(400).send("Not found");
});

creditCardRoutes.post("/getCardData", async (req, res) => {
  let result = await getOneCard(req.body._id, req.body.card_number, db);
  result != null
    ? res.status(201).send(result)
    : res.status(400).send("Not found");
});

creditCardRoutes.post("/removeCardData", async (req, res) => {
  (await removeCardData(req.body._id, req.body.card_number, db))
    ? res.status(201).send("OK")
    : res.status(400).send("Something went wrong");
});
export default creditCardRoutes;
