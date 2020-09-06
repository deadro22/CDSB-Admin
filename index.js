const express = require("express");
const mongoose = require("mongoose");
const app = express();
const joi = require("joi");
const session = require("express-session");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/Pages"));
app.use(
  session({
    secret: "1xFaz54fgagz5151azfg",
    saveUninitialized: true,
    resave: false,
    name: "CSD_CID",
  })
);

function protected(req, res, next) {
  if (!req.session.user) return res.status(403).redirect("/login");
  next();
}
function unprotected(req, res, next) {
  if (req.session.user) return res.status(200).redirect("/");
  next();
}

mongoose.connect(
  "mongodb+srv://CDSB:t4NH5vm2SKTMedTi@csdb-main-cluster.z2emz.mongodb.net/CDSB?retryWrites=true&w=majority",
  { useUnifiedTopology: true, useNewUrlParser: true },
  (err) => {
    if (err) throw err;
    console.log("Connected To DB");
  }
);

const member = new mongoose.Schema({
  name: { type: String, required: true },
  payed: { type: Number, required: true, default: 0 },
  subscribtion: { type: Date, required: true },
});
const members = mongoose.model("members", member);

app.get(["/", "/home"], protected, async (req, res) => {
  const allMembers = await members.find();
  res.render(__dirname + "/Pages/home.ejs", { allMembers });
});

app.get("/login", unprotected, async (req, res) => {
  res.render(__dirname + "/Pages/login.ejs");
});

app.post("/ajouter/nv", protected, async (req, res) => {
  const schemaVerify = joi.object({
    name: joi.string().required(),
    payed: joi.number().required(),
  });
  const { error } = schemaVerify.validate(req.body);
  if (error) return res.status(500).redirect("/");
  const newMember = new members({
    name: req.body.name,
    payed: req.body.payed,
    subscribtion: new Date(
      new Date().setFullYear(new Date().getFullYear() + 1)
    ),
  });
  await newMember.save();
  res.redirect("/");
});

app.post("/membre/:id/supprimer", async (req, res) => {
  await members.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

app.post("/login/n", unprotected, (req, res) => {
  const schemaVerify = joi.object({
    username: joi.string().required(),
    password: joi.string().required(),
  });
  const { error } = schemaVerify.validate(req.body);
  if (error) return res.status(500).redirect("/login");
  if (req.body.username !== "oussema" || req.body.password !== "sory")
    return res.status(403).redirect("/login");
  req.session.user = { isSigned: true };
  res.redirect("/");
});

app.listen(process.env.PORT || 3001, () => {
  console.log("Connected");
});
