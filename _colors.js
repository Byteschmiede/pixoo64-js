const COLOR_BLACK = [0, 0, 0];
const COLOR_WHITE = [255, 255, 255];

class Palette {
  static get BLACK() { return COLOR_BLACK; }
  static get WHITE() { return COLOR_WHITE; }
}

module.exports = { Palette, COLOR_BLACK, COLOR_WHITE };
