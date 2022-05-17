import { MongoClient } from "mongodb";

interface Options {
  log: boolean;
  exit: boolean;
}

export function exitHandler(db: MongoClient, options: Options) {
  if (options.log)
    console.log("Closing connection to MongoDB Atlas cluster...");

  db.close().catch((err) => {
    console.error(err);
  });

  if (options.log) console.log("Connection closed successfully.");

  if (options.exit) {
    console.log("Exiting app...");
    process.exit();
  }
}
