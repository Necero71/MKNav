/* MK NAVKIT core math. Pure functions, no DOM. */
(function (root) {
  'use strict';

  var MILS_PER_CIRCLE = 6400; // NATO mils

  function degToMils(d) { return d * MILS_PER_CIRCLE / 360; }
  function milsToDeg(m) { return m * 360 / MILS_PER_CIRCLE; }
  function norm360(d) { return ((d % 360) + 360) % 360; }

  /**
   * Parse a grid reference into metres inside the 100km square.
   * Accepts 4/6/8/10 digits (2/3/4/5 per axis). Spaces and separators ignored.
   * 6-digit "123 456" -> E 12300 m, N 45600 m (100 m precision).
   * Returns {e, n, digits, precision} or null.
   */
  function parseGrid(str) {
    if (typeof str !== 'string') return null;
    var d = str.replace(/\D/g, '');
    if (d.length < 4 || d.length > 10 || d.length % 2 !== 0) return null;
    var half = d.length / 2;
    var factor = Math.pow(10, 5 - half);
    return {
      e: parseInt(d.slice(0, half), 10) * factor,
      n: parseInt(d.slice(half), 10) * factor,
      digits: d.length,
      precision: factor
    };
  }

  function pad(n, len) {
    var s = String(n);
    while (s.length < len) s = '0' + s;
    return s;
  }

  /** Format metres E/N as a grid string with `perAxis` digits (3 = 6-digit, 4 = 8-digit). */
  function formatGrid(e, n, perAxis) {
    var factor = Math.pow(10, 5 - perAxis);
    var max = Math.pow(10, perAxis) - 1;
    var ge = Math.min(max, Math.max(0, Math.round(e / factor)));
    var gn = Math.min(max, Math.max(0, Math.round(n / factor)));
    return pad(ge, perAxis) + ' ' + pad(gn, perAxis);
  }

  /** Distance (m) and bearing (deg, 0-360) from grid a to grid b. */
  function gridToGrid(a, b) {
    var dE = b.e - a.e, dN = b.n - a.n;
    var dist = Math.sqrt(dE * dE + dN * dN);
    var deg = dist === 0 ? 0 : norm360(Math.atan2(dE, dN) * 180 / Math.PI);
    return { dist: dist, deg: deg, mils: degToMils(deg), dE: dE, dN: dN };
  }

  /** Project from origin {e,n} along bearing (deg) for dist metres. */
  function project(origin, bearingDeg, dist) {
    var r = bearingDeg * Math.PI / 180;
    return { e: origin.e + Math.sin(r) * dist, n: origin.n + Math.cos(r) * dist };
  }

  /** Range in metres from target size (m) and measured mils. */
  function rangeFromMils(sizeM, mils) {
    if (!(sizeM > 0) || !(mils > 0)) return NaN;
    return sizeM * 1000 / mils;
  }

  /** Mils a target of sizeM subtends at rangeM. */
  function milsAtRange(sizeM, rangeM) {
    if (!(sizeM > 0) || !(rangeM > 0)) return NaN;
    return sizeM * 1000 / rangeM;
  }

  /** Metres covered by `mils` at rangeM (lateral offset / lead). */
  function offsetMetres(mils, rangeM) {
    if (!(rangeM > 0) || isNaN(mils)) return NaN;
    return mils * rangeM / 1000;
  }

  /** Paces needed for distM given paces per 100 m. */
  function pacesForDistance(distM, per100) {
    if (!(per100 > 0) || !(distM >= 0)) return NaN;
    return distM * per100 / 100;
  }

  function distanceFromPaces(paces, per100) {
    if (!(per100 > 0) || !(paces >= 0)) return NaN;
    return paces * 100 / per100;
  }

  /** Seconds to cover distM at speedKph. */
  function travelSeconds(distM, speedKph) {
    if (!(speedKph > 0) || !(distM >= 0)) return NaN;
    return distM / (speedKph / 3.6);
  }

  function formatTime(sec) {
    if (!isFinite(sec)) return '--';
    var s = Math.round(sec);
    var m = Math.floor(s / 60), r = s % 60;
    if (m >= 60) {
      var h = Math.floor(m / 60);
      return h + 'h ' + pad(m % 60, 2) + 'm';
    }
    return m + ':' + pad(r, 2);
  }

  var api = {
    MILS_PER_CIRCLE: MILS_PER_CIRCLE,
    degToMils: degToMils, milsToDeg: milsToDeg, norm360: norm360,
    parseGrid: parseGrid, formatGrid: formatGrid,
    gridToGrid: gridToGrid, project: project,
    rangeFromMils: rangeFromMils, milsAtRange: milsAtRange, offsetMetres: offsetMetres,
    pacesForDistance: pacesForDistance, distanceFromPaces: distanceFromPaces,
    travelSeconds: travelSeconds, formatTime: formatTime
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.NavCore = api;
})(typeof self !== 'undefined' ? self : this);
