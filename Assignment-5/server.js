/********************************************************************************
*  WEB700 – Assignment 04
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Rahulkumar Kalidas Patel  Student ID: 127490241  Date: 08/11/2025
*
*  Published URL: 
*
********************************************************************************/

const express = require("express");
const path = require("path");

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// static
app.use(express.static(path.join(__dirname, "public")));

// form middleware (Assignment 5)
app.use(express.urlencoded({ extended: true }));

// EJS engine + views folder (Assignment 5 / Vercel-safe)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* Lego data module */
const LegoData = require("./modules/legoSets");
const legoData = new LegoData();

/* HOME */
app.get("/", (req, res) => {
  res.render("home");
});

/* ABOUT */
app.get("/about", (req, res) => {
  res.render("about");
});

/* ADD SET (form) */
app.get("/lego/addSet", async (req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    res.render("addSet", { themes });
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

/* PROCESS ADD SET */
app.post("/lego/addSet", async (req, res) => {
  try {
    // enrich with theme name before adding (Assignment 5)
    const t = await legoData.getThemeById(req.body.theme_id);
    req.body.theme = t.name; // add human-readable theme for rendering
    await legoData.addSet(req.body);
    res.redirect("/lego/sets");
  } catch (e) {
    res.status(422).send(e.toString());
  }
});

/* COLLECTION (with optional ?theme=...) */
app.get("/lego/sets", async (req, res) => {
  try {
    // build list & hydrate each set with theme name if missing
    let sets = await legoData.getAllSets();
    sets = await Promise.all(
      sets.map(async (s) => {
        if (!s.theme) {
          try {
            const th = await legoData.getThemeById(s.theme_id);
            return { ...s, theme: th?.name || s.theme };
          } catch {
            return { ...s };
          }
        }
        return s;
      })
    );

    const { theme } = req.query;
    if (theme) {
      const q = theme.toLowerCase();
      sets = sets.filter((s) => (s.theme || "").toLowerCase() === q);
    }

    res.render("sets", { sets });
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

/* SINGLE SET DETAILS */
app.get("/lego/sets/:set_num", async (req, res) => {
  try {
    const set = await legoData.getSetByNum(req.params.set_num);
    // hydrate theme name if needed
    if (!set.theme) {
      try {
        const th = await legoData.getThemeById(set.theme_id);
        set.theme = th?.name || set.theme;
      } catch {}
    }
    res.render("set", { set });
  } catch (e) {
    res.status(404).send(e.toString());
  }
});

/* DELETE SET */
app.get("/lego/deleteSet/:set_num", async (req, res) => {
  try {
    await legoData.deleteSetByNum(req.params.set_num);
    res.redirect("/lego/sets");
  } catch (e) {
    res.status(404).send(e.toString());
  }
});

/* 404 last */
app.use((req, res) => {
  res.status(404).render("404");
});

app.listen(HTTP_PORT, () => {
  console.log(`Server listening on: http://localhost:${HTTP_PORT}`);
});