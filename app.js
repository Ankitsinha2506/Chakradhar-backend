const express = require("express");
const app = express();
const connectDb = require("./DBConfig/db");
const userAppRouters = require("./routers/userRouters");
const PanchKrushnaRouters = require("./routers/PanchaKrushanRouter");
const DevPujaRouters = require("./routers/DevPujaRouter");
const ParayanRouters = require("./routers/ParayanRouter");
const BhajanSangrahRouters = require("./routers/BhajanSangrahRouter");
const AartiSangrahRouter = require("./routers/AartiSangrahRouter");
const BhagavatGitaRouter = require("./routers/BhagavatGItaRouter")

connectDb();

app.use(express.json());

app.use("/api/users", userAppRouters);
app.use("/api/panchakrushna", PanchKrushnaRouters);
app.use("/api/devpuja",DevPujaRouters);
app.use("/api/parayan",ParayanRouters);
app.use("/api/bhajanSangrah",BhajanSangrahRouters);
app.use("/api/aartiSangrah", AartiSangrahRouter);
app.use("/api/bhagavatgita", BhagavatGitaRouter);

module.exports = app;
