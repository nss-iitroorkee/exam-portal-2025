import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 3000;
connectDB()
  .then(() => {
    app.on("error", (error) => {
      throw error;
    });
    app.listen(port, () => {
      console.log(`Server is running on PORT : ${port}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error", error);
  });
