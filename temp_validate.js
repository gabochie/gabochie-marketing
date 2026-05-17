const fs = require("fs");
const html = fs.readFileSync("admin/index.html", "utf8");
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g);
if (scripts) {
  for (const s of scripts) {
    const js = s.replace(/<\/?script>/g, "");
    try { new Function(js); }
    catch(e) { console.log("Script error:", e.message); }
  }
}
console.log("Script count:", scripts?.length);
console.log("File size:", html.length, "bytes");
