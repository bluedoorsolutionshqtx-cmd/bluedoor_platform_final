import express from "express";
const app = express();
const port = process.env.PORT || 3032754;
app.use(express.static("apps/crew/public"));
app.listen(port, () => console.log("crew app up on :"+port));
