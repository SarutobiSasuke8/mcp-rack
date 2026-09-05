/* MCP Rack board. Reads window.MCP_RACK (data/servers.js) and renders everything.
   No build step, no dependencies. */
(function () {
  "use strict";
  const D = window.MCP_RACK;
  if (!D || !Array.isArray(D.servers)) {
    console.error("MCP Rack: data/servers.js did not load or has no servers array.");
    return;
  }

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const registryUrl = (name) =>
    "https://registry.modelcontextprotocol.io/v0.1/servers/" + encodeURIComponent(name) + "/versions/latest";

  /* ----- masthead meta ----- */
  $("#count-all").textContent = D.servers.length;
  $("#count-reg").textContent = D.servers.filter((s) => s.registry).length;
  $("#updated").textContent = D.updated || "";

  const clock = $("#clock");
  const tick = () => {
    const d = new Date();
    clock.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, "0")).join(":");
  };
  tick();
  setInterval(tick, 1000);

  /* ----- ticker ----- */
  const names = D.servers.map((s) => s.name);
  $("#ticker").innerHTML = names.concat(names).map((n) => "<span>" + esc(n) + "</span>").join("");

  /* ----- board ----- */
  const board = $("#board");
  let filter = "all";
  let q = "";

  const langClass = (lang) => "lang lang--" + String(lang).toLowerCase().replace(/[^a-z]/g, "");

  function unit(s, i) {
    const pkg = s.package && s.package.name
      ? '<code title="' + esc(s.package.kind + " " + s.package.name) + '">' + esc(s.package.name) + "</code>" +
        (s.package.version ? "<small>" + esc(s.package.version) + "</small>" : "")
      : '<code class="pkg--none">source only</code>';
    const lic = s.license ? '<span class="lic">' + esc(s.license) + "</span>" : "";
    const copy = s.install
      ? '<button class="copy" type="button" data-cmd="' + esc(s.install) + '" title="Copy: ' + esc(s.install) + '" aria-label="Copy install command for ' + esc(s.name) + '">copy</button>'
      : "";
    const reg = s.registry
      ? '<i class="dot dot--on"></i><a href="' + registryUrl(s.registry) + '" target="_blank" rel="noopener" title="' + esc(s.registry) + '">listed</a>'
      : '<i class="dot"></i>not yet';
    const status = String(s.status || "alpha").toLowerCase();
    return (
      '<li class="unit" style="--i:' + i + '">' +
        '<span class="unit__n">' + String(i + 1).padStart(2, "0") + "</span>" +
        '<div class="unit__main">' +
          '<h3 class="unit__name"><a href="' + esc(s.repo) + '" target="_blank" rel="noopener">' + esc(s.name) + "</a></h3>" +
          '<p class="unit__tag">' + esc(s.tagline) + "</p>" +
        "</div>" +
        '<div class="unit__meta">' +
          '<span class="' + langClass(s.lang) + '">' + esc(s.lang) + "</span>" +
          '<span class="transport">' + esc(s.transport || "stdio") + "</span>" +
          '<span class="reg">' + reg + "</span>" +
          '<span class="status status--' + esc(status) + '">' + esc(status) + "</span>" +
        "</div>" +
        '<div class="unit__pkg pkg">' + pkg + lic + copy + "</div>" +
      "</li>"
    );
  }

  function matches(s) {
    const byFilter =
      filter === "all" ||
      (filter === "registry" ? Boolean(s.registry) : String(s.lang).toLowerCase() === filter);
    if (!byFilter) return false;
    if (!q) return true;
    const hay = [s.name, s.tagline, s.transport, s.lang, s.license, s.package && s.package.name, (s.tags || []).join(" ")]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  }

  function render() {
    const list = D.servers.filter(matches);
    board.innerHTML = list.length
      ? list.map(unit).join("")
      : '<li class="empty">No unit matches "' + esc(q) + '" on this filter.</li>';
    $("#count-shown").textContent = list.length;
  }

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
      chip.setAttribute("aria-pressed", "true");
      filter = chip.dataset.filter;
      render();
    });
  });

  const input = $("#q");
  input.addEventListener("input", () => {
    q = input.value.trim().toLowerCase();
    render();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== input && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      input.focus();
    } else if (e.key === "Escape" && document.activeElement === input) {
      input.value = "";
      q = "";
      render();
      input.blur();
    }
  });

  /* copy install command, with a fallback for non-secure contexts (file://) */
  board.addEventListener("click", async (e) => {
    const btn = e.target.closest(".copy");
    if (!btn) return;
    const text = btn.dataset.cmd;
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    btn.dataset.done = "true";
    btn.textContent = "copied";
    setTimeout(() => {
      btn.dataset.done = "false";
      btn.textContent = "copy";
    }, 1400);
  });

  /* ----- the rack of other people's servers ----- */
  const rack = $("#rack");
  if (Array.isArray(D.rack)) {
    rack.innerHTML = D.rack
      .map(
        (r, i) =>
          '<a class="card" style="--i:' + i + '" href="' + esc(r.url) + '" target="_blank" rel="noopener">' +
            '<span class="card__k">' + esc(r.kind || "server") + "</span>" +
            '<span class="card__name">' + esc(r.name) + "</span>" +
            '<span class="card__by">' + esc(r.by) + "</span>" +
            '<span class="card__blurb">' + esc(r.blurb) + "</span>" +
          "</a>"
      )
      .join("");
  }

  /* ----- footer install examples: the first three units that have one ----- */
  const examples = D.servers.filter((s) => s.install).slice(0, 3);
  $("#install-examples").innerHTML = examples
    .map((s) => esc(s.install).replace(/^(\S+)/, "<b>$1</b>"))
    .join("\n");

  /* ----- structured data for search and answer engines ----- */
  try {
    const ld = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "MCP servers by " + (D.owner && D.owner.name ? D.owner.name : "SarutobiSasuke8"),
      itemListElement: D.servers.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "SoftwareSourceCode",
          name: s.name,
          description: s.tagline,
          codeRepository: s.repo,
          programmingLanguage: s.lang,
          license: s.license || undefined,
          author: { "@type": "Person", name: (D.owner && D.owner.name) || "SarutobiSasuke8", url: (D.owner && D.owner.url) || undefined },
        },
      })),
    };
    const tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.textContent = JSON.stringify(ld);
    document.head.appendChild(tag);
  } catch (_) { /* structured data is optional */ }

  render();
})();
