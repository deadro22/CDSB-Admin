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
    resave: true,
    saveUninitialized: false,
    name: "CSD_CID",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
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

const marcheMember = new mongoose.Schema({
  name: { type: String, required: true },
  payed: { type: Number, required: true, default: 0 },
  subscribtion: { type: Date, required: true },
});
const marcheMembers = mongoose.model("marche Members", marcheMember);

const footMember = new mongoose.Schema({
  name: { type: String, required: true },
  payed: { type: Number, required: true, default: 0 },
  subscribtion: { type: Date, required: true },
});
const footMembers = mongoose.model("foot Members", footMember);

app.get("/marche", protected, async (req, res) => {
  const allMembers = await marcheMembers.find();
  const marcheMembersCount = allMembers.length;
  const fMembersCount = await footMembers.find().select("name");
  const footMembersCount = fMembersCount.length;
  res.render(__dirname + "/Pages/home.ejs", {
    allMembers,
    footMembersCount,
    marcheMembersCount,
  });
});

app.get("/foot", protected, async (req, res) => {
  const allMembers = await footMembers.find();
  const footMembersCount = allMembers.length;
  const fMembersCount = await marcheMembers.find().select("name");
  const marcheMembersCount = fMembersCount.length;
  res.render(__dirname + "/Pages/foot.ejs", {
    allMembers,
    footMembersCount,
    marcheMembersCount,
  });
});

app.get("/login", unprotected, async (req, res) => {
  res.render(__dirname + "/Pages/login.ejs");
});

app.get("*", (req, res) => {
  res.redirect("/marche");
});

app.post("/ajouter/nv", protected, async (req, res) => {
  const schemaVerify = joi.object({
    name: joi.string().required(),
    payed: joi.number().required(),
  });
  const { error } = schemaVerify.validate(req.body);
  if (error) return res.status(500).redirect("/marche");
  const newMember = new marcheMembers({
    name: req.body.name,
    payed: req.body.payed,
    subscribtion: new Date(
      new Date().setFullYear(new Date().getFullYear() + 1)
    ),
  });
  await newMember.save();
  res.redirect("/marche");
});

app.post("/ajouter/foot/nv", protected, async (req, res) => {
  const schemaVerify = joi.object({
    name: joi.string().required(),
    payed: joi.number().required(),
  });
  const { error } = schemaVerify.validate(req.body);
  if (error) return res.status(500).redirect("/foot");
  const newMember = new footMembers({
    name: req.body.name,
    payed: req.body.payed,
    subscribtion: new Date(+new Date() + 30 * 3 * 24 * 60 * 60 * 1000),
  });
  await newMember.save();
  res.redirect("/foot");
});

app.post("/membre/:id/supprimer", async (req, res) => {
  await marcheMembers.findByIdAndDelete(req.params.id);
  res.redirect("/marche");
});

app.post("/membre/foot/:id/supprimer", async (req, res) => {
  await footMembers.findByIdAndDelete(req.params.id);
  res.redirect("/foot");
});

app.post("/login/n", unprotected, (req, res) => {
  const schemaVerify = joi.object({
    username: joi.string().required(),
    password: joi.string().required(),
  });
  const { error } = schemaVerify.validate(req.body);
  if (error) return res.status(500).redirect("/login");
  if (req.body.username !== "saydia" || req.body.password !== "walkfoot2020")
    return res.status(403).redirect("/login");
  req.session.user = { isSigned: true };
  res.redirect("/marche");
});

app.listen(process.env.PORT || 3001, () => {
  console.log("Connected");
});
