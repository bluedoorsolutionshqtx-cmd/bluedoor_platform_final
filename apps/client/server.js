import express from "express";
const app = express();
const port = process.env.PORT || 3024598;
app.use(express.static("apps/client/public"));
app.listen(port, () => console.log("client app up on :"+port));
