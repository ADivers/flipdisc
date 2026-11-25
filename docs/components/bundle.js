/* @ds-bundle: {"format":4,"namespace":"Flipdisc","components":[{"name":"DiscDisplay"},{"name":"Button"},{"name":"NavBar"},{"name":"Panel"},{"name":"StatusDisc"},{"name":"DiscField"}]} */
(function () {
  "use strict";
  var React = window.React, h = React.createElement;

  /* 5x7 dot font. Each glyph: 7 rows, 2 hex digits per row, bit 4 = leftmost column. */
  var FONT = {
    A: "0E1111111F1111", B: "1E11111E11111E", C: "0E11101010110E", D: "1C12111111121C",
    E: "1F10101E10101F", F: "1F10101E101010", G: "0E11101711110F", H: "1111111F111111",
    I: "0E04040404040E", J: "0702020202120C", K: "11121418141211", L: "1010101010101F",
    M: "111B1515111111", N: "11111915131111", O: "0E11111111110E", P: "1E11111E101010",
    Q: "0E11111115120D", R: "1E11111E141211", S: "0F10100E01011E", T: "1F040404040404",
    U: "1111111111110E", V: "11111111110A04", W: "1111111515150A", X: "11110A040A1111",
    Y: "1111110A040404", Z: "1F01020408101F",
    "0": "0E11131519110E", "1": "040C040404040E", "2": "0E11010204081F", "3": "1F02040201110E",
    "4": "02060A121F0202", "5": "1F101E0101110E", "6": "0608101E11110E", "7": "1F010204080808",
    "8": "0E11110E11110E", "9": "0E11110F01020C",
    ".": "00000000000C0C", ",": "000000000C0408", ":": "000C0C000C0C00", "-": "0000001F000000",
    "!": "04040404040004", "?": "0E110102040004", "/": "00010204081000", "'": "0C040800000000",
    "&": "0C12140815120D", "+": "0004041F040400", ">": "08040201020408", "<": "02040810080402",
    "#": "0A0A1F0A1F0A0A", "=": "00001F001F0000", "*": "00040A1F0A0400", "(": "02040808080402", ")": "08040202020408"
  };
  var cache = {};
  function glyph(ch) {
    if (cache[ch]) return cache[ch];
    var hex = FONT[ch];
    if (!hex) return (cache[ch] = [0, 0]);
    var rows = [], cols = [], r, c;
    for (r = 0; r < 7; r++) rows.push(parseInt(hex.substr(r * 2, 2), 16));
    for (c = 0; c < 5; c++) {
      var m = 0;
      for (r = 0; r < 7; r++) if ((rows[r] >> (4 - c)) & 1) m |= 1 << r;
      cols.push(m);
    }
    var a = 0, b = 4;
    while (a < 4 && !cols[a]) a++;
    while (b > a && !cols[b]) b--;
    return (cache[ch] = cols.slice(a, b + 1));
  }
  function columns(text) {
    var s = String(text == null ? "" : text).toUpperCase(), out = [];
    for (var i = 0; i < s.length; i++) {
      if (i) out.push(0);
      out = out.concat(glyph(s[i]));
    }
    return out;
  }
  function pitchValue(p) {
    if (typeof p === "number") return p + "px";
    return "var(--pitch-" + (p || "md") + ")";
  }

  function DiscDisplay(props) {
    var messages = props.messages && props.messages.length ? props.messages : [props.text || ""];
    var rows = Math.max(7, props.rows || 9);
    var padX = props.padX == null ? 1 : props.padX;
    var align = props.align || "left";
    var stagger = props.stagger == null ? 14 : props.stagger;
    var interval = props.interval || 3200;
    var boot = props.boot !== false;

    var st = React.useState(boot ? -1 : 0), idx = st[0], setIdx = st[1];
    React.useEffect(function () {
      if (idx !== -1) return;
      var raf = requestAnimationFrame(function () { raf = requestAnimationFrame(function () { setIdx(0); }); });
      return function () { cancelAnimationFrame(raf); };
    }, [idx]);
    React.useEffect(function () {
      if (idx < 0 || messages.length < 2) return;
      var t = setTimeout(function () { setIdx((idx + 1) % messages.length); }, interval);
      return function () { clearTimeout(t); };
    }, [idx, messages.length, interval]);

    var widest = 0;
    for (var k = 0; k < messages.length; k++) widest = Math.max(widest, columns(messages[k]).length);
    var cols = props.cols || widest + padX * 2;
    var text = idx < 0 ? "" : messages[idx];
    var content = columns(text);
    var room = cols - padX * 2;
    if (content.length > room) content = content.slice(0, Math.max(0, room));
    var offset = align === "center" ? Math.floor((cols - content.length) / 2)
      : align === "right" ? cols - padX - content.length : padX;
    var top = Math.floor((rows - 7) / 2);

    var n = cols * rows, bits = new Array(n), i, r, c;
    for (i = 0; i < n; i++) bits[i] = 0;
    for (c = 0; c < content.length; c++) {
      var col = content[c];
      if (!col) continue;
      for (r = 0; r < 7; r++) if ((col >> r) & 1) bits[(top + r) * cols + offset + c] = 1;
    }

    var prev = React.useRef(null), moved = React.useRef({});
    if (prev.current && prev.current.length === n) {
      for (i = 0; i < n; i++) if (prev.current[i] !== bits[i]) moved.current[i] = 1;
    } else if (prev.current) {
      moved.current = {};
    }
    prev.current = bits;

    var cells = new Array(n);
    for (i = 0; i < n; i++) {
      var mv = moved.current[i];
      cells[i] = h("span", {
        key: i,
        className: "fd-d" + (bits[i] ? " on" : "") + (mv ? " m" : ""),
        style: mv ? { "--d": (i % cols) * stagger + "ms" } : undefined
      });
    }
    var label = props.label || (messages.length > 1 ? messages.join(" · ") : messages[0]);
    return h("div", {
      className: ["fd-board", props.color === "orange" ? "fd-orange" : "", props.fit ? "fd-fit" : "", props.className].filter(Boolean).join(" "),
      role: "img",
      "aria-label": label,
      style: Object.assign({ "--fd-cols": cols, "--fd-pitch": pitchValue(props.pitch) }, props.style || {})
    }, cells);
  }

  function omit(obj, keys) {
    var o = {};
    for (var key in obj) if (Object.prototype.hasOwnProperty.call(obj, key) && keys.indexOf(key) < 0) o[key] = obj[key];
    return o;
  }

  function Button(props) {
    var variant = props.variant || "primary";
    var rest = omit(props, ["variant", "dot", "size", "className", "children"]);
    var tag = props.href ? "a" : "button";
    if (tag === "button" && !rest.type) rest.type = "button";
    rest.className = ["fd-btn", "fd-btn-" + variant, props.size === "sm" ? "fd-btn-sm" : "", props.className].filter(Boolean).join(" ");
    return h(tag, rest, props.dot ? h("span", { className: "fd-btn-dot", "aria-hidden": "true" }) : null, props.children);
  }

  function NavBar(props) {
    var links = props.links || [];
    return h("header", { className: ["fd-nav", props.className].filter(Boolean).join(" ") },
      h("a", { className: "fd-nav-brand", href: props.brandHref || "#", "aria-label": props.brand + " home" },
        h(DiscDisplay, { text: props.brand, pitch: props.brandPitch || "sm", rows: 9, boot: false, color: props.brandColor })),
      h("nav", { className: "fd-nav-links", "aria-label": "Primary" },
        links.map(function (l, j) {
          return h("a", { key: j, href: l.href || "#", className: "fd-nav-link" + (l.active ? " is-active" : ""), "aria-current": l.active ? "page" : undefined }, l.label);
        })),
      props.action ? h("div", { className: "fd-nav-action" }, props.action) : null);
  }

  function Panel(props) {
    return h("section", { className: ["fd-panel", props.tone === "board" ? "fd-panel-board" : "", props.className].filter(Boolean).join(" ") },
      props.label ? h("div", { className: "fd-label" }, props.label) : null,
      props.title ? h("h3", { className: "fd-panel-title" }, props.title) : null,
      props.children ? h("div", { className: "fd-panel-body" }, props.children) : null);
  }

  function StatusDisc(props) {
    var state = props.state || "on";
    return h("span", { className: "fd-status" },
      h("span", { className: "fd-status-disc is-" + state, "aria-hidden": "true" }),
      props.children);
  }

  /* DiscField: one canvas turns a whole region (or page) into a flip-disc board.
     Unlit discs are a CSS background pattern (zero cost); the canvas covers only the
     visible window and draws lit discs plus the discs that are mid-flip. Elements inside
     opt in with data-disc="text|fill|outline|clear". */
  var DUR = 180;
  function createField(root, opt) {
    var canvas = root.querySelector(".fd-field-canvas"), ctx = canvas.getContext("2d");
    var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var pitch = 0, cols = 0, rows = 0, cur, tgt, from, to, start, anims = [];
    var colors, housing, sprites, dpr = 1, view = { top: -1, h: 0, w: 0 };
    var hovered = null, seen = new WeakSet(), observed = new WeakSet(), t0 = Date.now(), booted = false;
    var raf = 0, queued = 0, flags = { layout: false, target: false, view: false };
    root.classList.add("fd-field-live");

    function readColors() {
      var cs = getComputedStyle(root);
      function g(n, d) { return cs.getPropertyValue(n).trim() || d; }
      colors = [g("--disc-off", "#1b1b1b"), g("--disc-white", "#f2f2ea"), g("--disc-orange", "#ff7a00")];
      housing = g("--housing", "#050505");
    }
    function makeSprites() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      sprites = colors.map(function (c) {
        var s = document.createElement("canvas"), n = Math.round(pitch * dpr);
        s.width = s.height = n;
        var x = s.getContext("2d");
        x.fillStyle = housing; x.fillRect(0, 0, n, n);
        x.fillStyle = c; x.beginPath(); x.arc(n / 2, n / 2, n * 0.42, 0, Math.PI * 2); x.fill();
        return s;
      });
    }
    function colorIndex(v) { return v === "orange" ? 2 : v === "off" ? 0 : 1; }

    function layout() {
      var w = root.clientWidth, hgt = root.offsetHeight;
      var p = w < (opt.breakpoint || 640) ? opt.pitchSm : opt.pitch;
      var reset = false;
      if (p !== pitch) { pitch = p; root.style.setProperty("--fd-field-pitch", p + "px"); makeSprites(); reset = true; }
      var nc = Math.ceil(w / p), nr = Math.ceil(hgt / p) + 1;
      if (nc !== cols || nr !== rows) {
        var n = nc * nr, keep = !reset && nc === cols && cur;
        var nCur = new Uint8Array(n), nTgt = new Uint8Array(n), nFrom = new Uint8Array(n), nTo = new Uint8Array(n), nStart = new Float64Array(n).fill(NaN);
        if (keep) {
          var m = Math.min(n, cur.length);
          nCur.set(cur.subarray(0, m)); nTgt.set(tgt.subarray(0, m)); nFrom.set(from.subarray(0, m)); nTo.set(to.subarray(0, m)); nStart.set(start.subarray(0, m));
          anims = anims.filter(function (i) { return i < n; });
        } else { anims = []; }
        cur = nCur; tgt = nTgt; from = nFrom; to = nTo; start = nStart; cols = nc; rows = nr;
        return keep ? "grow" : "reset";
      }
      return reset ? "reset" : "";
    }

    function compute() {
      var t = new Uint8Array(cols * rows), rr = root.getBoundingClientRect();
      var els = root.querySelectorAll("[data-disc]"), tick = Math.floor((Date.now() - t0) / opt.interval);
      function set(r, c, v) { if (r >= 0 && r < rows && c >= 0 && c < cols) t[r * cols + c] = v; }
      for (var e = 0; e < els.length; e++) {
        var el = els[e];
        if (io && !observed.has(el)) { observed.add(el); io.observe(el); }
        if (!seen.has(el)) continue;
        var b = el.getBoundingClientRect();
        if (!b.width && !b.height) continue;
        var L = b.left - rr.left, T = b.top - rr.top, R = b.right - rr.left, B = b.bottom - rr.top;
        var mode = el.getAttribute("data-disc");
        var hv = el === hovered && el.getAttribute("data-disc-hover");
        var col = colorIndex(hv || el.getAttribute("data-disc-color"));
        var c0 = Math.ceil(L / pitch - 0.5), c1 = Math.floor(R / pitch - 0.5);
        var r0 = Math.ceil(T / pitch - 0.5), r1 = Math.floor(B / pitch - 0.5), r, c;
        if (mode === "fill" || mode === "clear") {
          var v = mode === "clear" ? 0 : col;
          for (r = r0; r <= r1; r++) for (c = c0; c <= c1; c++) set(r, c, v);
        } else if (mode === "outline") {
          for (c = c0; c <= c1; c++) { set(r0, c, col); set(r1, c, col); }
          for (r = r0; r <= r1; r++) { set(r, c0, col); set(r, c1, col); }
        } else if (mode === "text") {
          var msgs = (el.getAttribute("data-disc-messages") || "").split("|").filter(Boolean);
          if (!msgs.length) msgs = [el.textContent.trim()];
          var txt = msgs[tick % msgs.length], widest = 0;
          for (var k = 0; k < msgs.length; k++) widest = Math.max(widest, columns(msgs[k]).length);
          var align = el.getAttribute("data-disc-align") || "left";
          var maxW = align === "left" ? (+el.getAttribute("data-disc-max") || rr.width - L) : R - L;
          var avail = Math.max(1, Math.floor(maxW / pitch));
          var s = Math.max(1, Math.min(+el.getAttribute("data-disc-scale") || 1, Math.floor(avail / Math.max(1, widest))));
          var needH = 7 * s * pitch + "px";
          if (el.style.height !== needH) el.style.height = needH;
          if (align === "left") {
            var needW = Math.min(widest * s, avail) * pitch + "px";
            if (el.style.width !== needW) el.style.width = needW;
            avail = Math.min(widest * s, avail);
          } else {
            avail = c1 - c0 + 1;
          }
          var gl = columns(txt), maxG = Math.floor(avail / s);
          if (gl.length > maxG) gl = gl.slice(0, maxG);
          var w = gl.length * s;
          var off = align === "center" ? Math.floor((avail - w) / 2) : align === "right" ? avail - w : 0;
          var rt = Math.round(T / pitch);
          for (var g = 0; g < gl.length; g++) {
            if (!gl[g]) continue;
            for (r = 0; r < 7; r++) if ((gl[g] >> r) & 1)
              for (var sy = 0; sy < s; sy++) for (var sx = 0; sx < s; sx++) set(rt + r * s + sy, c0 + off + g * s + sx, col);
          }
        }
      }
      return t;
    }

    function retarget(instant) {
      var t = compute(), now = performance.now(), minC = Infinity, maxC = -1, i, n = t.length;
      for (i = 0; i < n; i++) if (t[i] !== tgt[i]) { var c = i % cols; if (c < minC) minC = c; if (c > maxC) maxC = c; }
      if (maxC < 0) return;
      var st = Math.min(14, opt.sweep / Math.max(1, maxC - minC + 1));
      for (i = 0; i < n; i++) {
        if (t[i] === tgt[i]) continue;
        tgt[i] = t[i];
        if (instant || reduce) { cur[i] = t[i]; start[i] = NaN; continue; }
        if (isNaN(start[i])) { from[i] = cur[i]; to[i] = t[i]; start[i] = now + ((i % cols) - minC) * st; anims.push(i); }
      }
      if (instant || reduce) { anims = anims.filter(function (j) { return !isNaN(start[j]); }); redraw(); }
      else if (!raf) raf = requestAnimationFrame(frame);
    }

    function drawCell(i, state, sx) {
      var x = (i % cols) * pitch, y = Math.floor(i / cols) * pitch - view.top;
      if (y <= -pitch || y >= view.h) return;
      ctx.clearRect(x, y, pitch, pitch);
      if (sx >= 0.999) { if (state) ctx.drawImage(sprites[state], x, y, pitch, pitch); return; }
      ctx.fillStyle = housing; ctx.fillRect(x, y, pitch, pitch);
      ctx.fillStyle = colors[state]; ctx.beginPath();
      ctx.ellipse(x + pitch / 2, y + pitch / 2, Math.max(0.3, pitch * 0.42 * sx), pitch * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    function frame(now) {
      raf = 0;
      var keep = [];
      for (var a = 0; a < anims.length; a++) {
        var i = anims[a], p = (now - start[i]) / DUR;
        if (isNaN(p)) continue;
        if (p < 0) { keep.push(i); continue; }
        if (p >= 1) {
          cur[i] = to[i]; start[i] = NaN; drawCell(i, cur[i], 1);
          if (cur[i] !== tgt[i]) { from[i] = cur[i]; to[i] = tgt[i]; start[i] = now; keep.push(i); }
        } else {
          drawCell(i, p < 0.5 ? from[i] : to[i], Math.abs(1 - 2 * p));
          keep.push(i);
        }
      }
      anims = keep;
      if (anims.length) raf = requestAnimationFrame(frame);
    }
    function measureView() {
      var rr = root.getBoundingClientRect(), vh = window.innerHeight || document.documentElement.clientHeight;
      var top = Math.max(0, Math.floor(-rr.top)), bottom = Math.min(rr.height, vh - rr.top);
      var h = Math.max(0, Math.ceil(bottom - top)), w = root.clientWidth;
      if (h !== view.h || w !== view.w) {
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
        canvas.style.width = w + "px"; canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      if (top !== view.top) canvas.style.top = top + "px";
      view = { top: top, h: h, w: w };
    }
    function redraw() {
      measureView();
      ctx.clearRect(0, 0, view.w, view.h);
      var ra = Math.max(0, Math.floor(view.top / pitch)), rb = Math.min(rows - 1, Math.ceil((view.top + view.h) / pitch));
      for (var r = ra; r <= rb; r++) for (var c = 0; c < cols; c++) {
        var i = r * cols + c;
        if (cur[i] && isNaN(start[i])) drawCell(i, cur[i], 1);
      }
      if (anims.length && !raf) raf = requestAnimationFrame(frame);
    }

    function run() {
      queued = 0;
      var f = flags; flags = { layout: false, target: false, view: false };
      if (f.layout) {
        var how = layout();
        if (how === "reset") { if (booted) { retarget(true); return redraw(); } }
        f.target = true; f.view = true;
      }
      if (f.target) { retarget(false); booted = true; }
      if (f.view) redraw();
    }
    function queue(k) { flags[k] = true; if (!queued) queued = requestAnimationFrame(run); }

    var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
      var any = false;
      entries.forEach(function (en) { if (en.isIntersecting && !seen.has(en.target)) { seen.add(en.target); any = true; } });
      if (any) queue("target");
    }, { threshold: 0.15 }) : null;
    if (!io) root.querySelectorAll("[data-disc]").forEach(function (el) { seen.add(el); });
    else {
      var vh0 = window.innerHeight;
      root.querySelectorAll("[data-disc]").forEach(function (el) {
        var b = el.getBoundingClientRect();
        if (b.bottom > 0 && b.top < vh0) seen.add(el);
      });
    }

    var ro = new ResizeObserver(function () { queue("layout"); });
    ro.observe(root);
    var mo = new MutationObserver(function () { queue("target"); });
    mo.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["data-disc", "data-disc-color", "data-disc-messages", "data-disc-hover", "data-disc-scale", "data-disc-align"] });
    function onScroll() { queue("view"); }
    function onOver(e) {
      var el = e.target && e.target.closest ? e.target.closest("[data-disc-hover]") : null;
      if (el && !root.contains(el)) el = null;
      if (el !== hovered) { hovered = el; queue("target"); }
    }
    function onLeave() { if (hovered) { hovered = null; queue("target"); } }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    root.addEventListener("pointerover", onOver);
    root.addEventListener("focusin", onOver);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("focusout", onLeave);
    var timer = setInterval(function () { if (root.querySelector("[data-disc-messages]")) queue("target"); }, opt.interval);

    readColors();
    flags.layout = true; run();

    return {
      destroy: function () {
        clearInterval(timer); ro.disconnect(); mo.disconnect(); if (io) io.disconnect();
        if (raf) cancelAnimationFrame(raf); if (queued) cancelAnimationFrame(queued);
        window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll);
        root.removeEventListener("pointerover", onOver); root.removeEventListener("focusin", onOver);
        root.removeEventListener("pointerleave", onLeave); root.removeEventListener("focusout", onLeave);
        root.classList.remove("fd-field-live");
      }
    };
  }

  function DiscField(props) {
    var ref = React.useRef(null);
    var pitch = props.pitch || 8, pitchSm = props.pitchSm || 5, interval = props.interval || 3200, sweep = props.sweep || 700;
    React.useEffect(function () {
      if (!ref.current || !window.ResizeObserver || !window.MutationObserver) return;
      var f = createField(ref.current, { pitch: pitch, pitchSm: pitchSm, interval: interval, sweep: sweep, breakpoint: props.breakpoint || 640 });
      return function () { f.destroy(); };
    }, [pitch, pitchSm, interval, sweep]);
    return h("div", { ref: ref, className: ["fd-field", props.className].filter(Boolean).join(" "), style: Object.assign({ "--fd-field-pitch": pitch + "px" }, props.style || {}) },
      h("canvas", { className: "fd-field-canvas", "aria-hidden": "true" }),
      h("div", { className: "fd-field-content" }, props.children));
  }

  var api = { DiscDisplay: DiscDisplay, Button: Button, NavBar: NavBar, Panel: Panel, StatusDisc: StatusDisc, DiscField: DiscField };
  window.Flipdisc = Object.assign(window.Flipdisc || {}, api);
})();
