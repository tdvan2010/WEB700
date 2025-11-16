const fs = require("fs/promises");
const path = require("path");

class LegoData {
  constructor() {
    this.sets = [];
    this.themes = [];
    this._initialized = false;
  }

  async _ensureInit() {
    if (this._initialized) return;
    const setsPath = path.join(__dirname, "..", "setData.json");
    const themesPath = path.join(__dirname, "..", "themeData.json");

    const [setsRaw, themesRaw] = await Promise.all([
      fs.readFile(setsPath, "utf8"),
      fs.readFile(themesPath, "utf8"),
    ]);

    const setData = JSON.parse(setsRaw);
    const themeData = JSON.parse(themesRaw);

    // Assignment 5 Part 1
    this.sets = [...setData];
    this.themes = [...themeData];

    this._initialized = true;
  }

  /* Part 1: required helpers */
  async getAllSets() {
    await this._ensureInit();
    return this.sets;
  }
  async getSets() {
    // keep A4 name for compatibility
    return this.getAllSets();
  }
  async getSetByNum(setNum) {
    await this._ensureInit();
    const found = this.sets.find((s) => s.set_num == setNum);
    if (!found) throw "unable to find requested set";
    return found;
  }

  async getAllThemes() {
    await this._ensureInit();
    return this.themes;
  }
  async getThemeById(id) {
    await this._ensureInit();
    const t = this.themes.find((x) => x.id == id);
    if (!t) throw "unable to find requested theme";
    return t;
  }

  /* A4/A5 addSet */
  async addSet(newSet) {
    await this._ensureInit();
    const exists = this.sets.find((s) => s.set_num === newSet.set_num);
    if (exists) throw "Set already exists";
    this.sets.push({
      set_num: String(newSet.set_num),
      name: String(newSet.name),
      year: String(newSet.year),
      theme_id: String(newSet.theme_id),
      num_parts: String(newSet.num_parts),
      img_url: String(newSet.img_url),
      // Optional: theme (human-readable) is added by server for rendering
      ...(newSet.theme ? { theme: String(newSet.theme) } : {}),
    });
  }

  /* Part 6 delete */
  async deleteSetByNum(setNum) {
    await this._ensureInit();
    const idx = this.sets.findIndex((s) => s.set_num == setNum);
    if (idx === -1) throw "set not found";
    this.sets.splice(idx, 1);
  }
}

module.exports = LegoData;
