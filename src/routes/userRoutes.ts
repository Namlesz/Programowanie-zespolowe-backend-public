//Import node modules
import express from "express";
import multer from "multer";
import fs from "fs";
import bcrypt from "bcrypt";

//Import connection
import MongoConnection from "../configs/db.config.js";

//Import user model
import User, {isUser, mapToUser} from "../models/user.js";

//Import controllers
import * as UserController from "../controllers/userControllers.js";

//Import config
import {saltRounds} from "../middlewares/passwordGenerator.js";

const userRoutes = express();
const upload = multer({dest: "uploads/"});
let db = MongoConnection.db("Zespolowka");

userRoutes.post("/register", async (req, res) => {
    let newUser: User;

    //Check if required fields is not empty
    if (isUser(req.body)) {
        newUser = mapToUser(req.body);
    
        if(newUser.email)
            newUser.email = newUser.email.toLowerCase();
    } else {
        res.status(400).send("Empty data");
        return;
    }
    
    //Verify if email is correct
    if (!UserController.verifyEmailFormat(<string>newUser.email)) {
        res.status(400).send("Wrong email format");
        return;
    }

    //Check if email is free insert user to database
    if ((await UserController.verifyRegistrationData(newUser, db)) == null) {
        let hash: string;
        !newUser.password ? hash = "" : hash = newUser.password;
        newUser.password = bcrypt.hashSync(hash, saltRounds);

        //set initial values for number of comments and rating
        newUser.rating = 0;
        newUser.commentsAboutUser = 0;

        (await db.collection("users").insertOne(newUser))
            ? res.status(201).send("OK")
            : res.status(500).send("Insert error");
    } else {
        res.status(409).send("User exists");
    }
});

userRoutes.post("/login", async (req, res) => {
    let userData: User = mapToUser(req.body);

    if(userData.email)
        userData.email = userData.email.toLowerCase();
    
        //Verify email format
    if (UserController.verifyEmailFormat(<string>userData.email)) {
        //Get user by email and password in database
        let loginUser = await UserController.getAccount(userData, db);

        if (loginUser != null && bcrypt.compareSync(req.body.password, loginUser.password))
            res.status(200).send({_id: loginUser._id});
        else
            res.status(404).send("Wrong email or password");

    } else res.status(500).send("Wrong email format");
});

userRoutes.post("/changeUserData", async (req, res) => {
    if(!UserController.verifyBankAccountNumber(req.body.bank_account) && req.body.bank_account != undefined) res.status(400).send("Incorrect bank account number");
    (await UserController.changeUserData(mapToUser(req.body), db))
        ? res.status(201).send("Data changed")
        : res.status(400).send("Incorrect data");
});

userRoutes.post(
    "/changeUserAvatar",
    upload.single("image"),
    async (req, res) => {
        try {
            if (req.file) {
                let encodedImg = fs.readFileSync(req.file.path).toString("base64");
                let finalImg = {
                    contentType: req.file.mimetype,
                    image: new Buffer(encodedImg, "base64"),
                };
                (await UserController.changeUserAvatar(req.body._id, db, finalImg))
                    ? res.status(201).send("OK")
                    : res.status(500).send("Insert error");
            }
        } catch (error) {
            console.error(error);
            res.status(400).send("ERROR");
        }
    }
);

//not used
userRoutes.post("/getUserAvatar", async (req, res) => {
    try {
        let avatar = await UserController.getAvatarOfUser(req.body._id, db);
        avatar ? res.status(201).send(avatar) : res.status(500).send("Error");
    } catch (error) {
        console.error(error);
        res.status(400).send("ERROR");
    }
});

userRoutes.post("/userInfo", async (req, res) => {
    let user = await UserController.getUserInfo(req.body._id, db);
    user ? res.status(201).send(user) : res.status(400).send("Not found");
});

userRoutes.post("/getAccountNumber", async (req, res) => {
    let bankAccount = await UserController.getBankAccountNumber(req.body._id, db);
    bankAccount
        ? res.status(201).send(bankAccount)
        : res.status(400).send("Not found");
});

userRoutes.post("/changePassword", async (req, res) => {
    let data = req.body;

    if (!data.newPassword) {
        res.status(404).send("Password can't be null");
        return;
    }
    //Check if email and password are correct and existing in database
    let loginUser = await UserController.getAccount(mapToUser(data), db);
    if (loginUser != null && bcrypt.compareSync(req.body.password, loginUser.password)) {
        data.newPassword = bcrypt.hashSync(data.newPassword, saltRounds);
        (await UserController.changePassword(data, db))
            ? res.status(201).send("Password changed")
            : res.status(400).send("Incorrect data");
    } else
        res.status(404).send("Wrong id or password");
});

userRoutes.post("/resetPassword", async (req, res) => {
    (await UserController.resetPassword(req.body.email.toLowerCase(), db))
        ? res.status(201).send("Password reset")
        : res.status(400).send("Something went wrong");
});

userRoutes.post("/getRatingOfUser", async (req, res) => {
    let result = await UserController.getRatingOfUser(req.body.userId, db);
    result ? res.status(200).send(result) : res.status(400).send("Error");
});

export default userRoutes;
