import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5180", "https://nss.iitr.ac.in/jee", "http://localhost:4173"],
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "20kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "20kb",
  })
);

app.use(express.static("public"));

app.use(cookieParser());

import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import testRoutes from "./routes/test.routes.js";

app.use("/users", userRoutes);
app.use("/admins", adminRoutes);
app.use("/tests", testRoutes);



export { app };
