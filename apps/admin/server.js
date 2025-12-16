import express from "express";
const app = express();
const port = process.env.PORT || 3025470;
app.use(express.static("apps/admin/public"));
app.listen(port, () => console.log("admin app up on :"+port));
