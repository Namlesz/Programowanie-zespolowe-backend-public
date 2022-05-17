import {ObjectId} from "mongodb";

interface Order {
    userId: ObjectId,
    noteId: ObjectId,
    date: Date,
    price: String
}

export default Order;