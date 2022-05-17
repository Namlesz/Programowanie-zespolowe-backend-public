import { MongoClient } from "mongodb";

const uriNew = "your_database_uri";

let MongoConnection: MongoClient;
MongoConnection = new MongoClient(uriNew);

export async function connectToCluster() {
  try {
    console.log("Connecting to MongoDB Atlas cluster...");
    await MongoConnection.connect();
    console.log("Successfully connected to MongoDB Atlas!");
  } catch (error) {
    console.error("Connection to MongoDB Atlas failed!", error);
    process.exit();
  }
}

export default MongoConnection;
