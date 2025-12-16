import express from "express";
const app = express();
const port = process.env.PORT || 3022653;
app.use(express.static("apps/manager/public"));
app.listen(port, () => console.log("manager app up on :"+port));
