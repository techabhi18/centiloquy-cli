import fs from "fs";

export default function genCmd(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  const groupedFieldIds = new Set();
  for (const block of content.matchAll(/groupedFields\s*:\s*\[([\s\S]*?)\]/g)) {
    for (const m of block[1].matchAll(/identifier:\s*"([^"]+)"/g)) {
      groupedFieldIds.add(m[1]);
    }
  }

  const fixedGroups = [];
  const injectedIds = [];
  const lines = [];

  for (const fm of content.matchAll(
    /fieldType:\s*"fixedGroup"[\s\S]*?identifier:\s*"([^"]+)"[\s\S]*?fixedGroups\s*:\s*\[([\s\S]*?)\]/g
  )) {
    const mainId = fm[1];
    const nestedBlock = fm[2];
    const nestedId = nestedBlock.match(/identifier:\s*"([^"]+)"/)[1];

    fixedGroups.push({ mainId, nestedId });
    injectedIds.push(mainId);
    lines.push(
      `        const ${mainId} = this.getFieldParameter("${mainId}", i);`
    );
  }

  for (const fm of content.matchAll(
    /fieldType:\s*"([^"]+)"[\s\S]*?identifier:\s*"([^"]+)"/g
  )) {
    const [_, type, id] = fm;
    if (
      type === "fixedGroup" ||
      injectedIds.includes(id) ||
      groupedFieldIds.has(id)
    )
      continue;
    injectedIds.push(id);
    lines.push(`        const ${id} = this.getFieldParameter("${id}", i);`);
  }

  lines.push(``);
  lines.push(`        let requestData = {`);
  for (const id of injectedIds) {
    const fg = fixedGroups.find((f) => f.mainId === id);
    if (fg) {
      lines.push(
        `          ...(${id}?.${fg.nestedId} && { ${id}: ${id}.${fg.nestedId} }),`
      );
    } else {
      lines.push(`          ${id},`);
    }
  }
  lines.push(`        };`);
  lines.push(``);

  lines.push(`        function deepClean(obj) {`);
  lines.push(`          if (Array.isArray(obj)) {`);
  lines.push(`            return obj`);
  lines.push(`              .map(deepClean)`);
  lines.push(
    `              .filter(v => v !== null && v !== undefined && v !== "");`
  );
  lines.push(`          }`);
  lines.push(`          if (typeof obj === "object" && obj !== null) {`);
  lines.push(`            return Object.fromEntries(`);
  lines.push(`              Object.entries(obj)`);
  lines.push(`                .map(([k, v]) => [k, deepClean(v)])`);
  lines.push(`                .filter(([_, v]) =>`);
  lines.push(`                  v !== null &&`);
  lines.push(`                  v !== undefined &&`);
  lines.push(`                  v !== "" &&`);
  lines.push(
    `                  (typeof v !== "object" || Object.keys(v).length > 0)`
  );
  lines.push(`                )`);
  lines.push(`            );`);
  lines.push(`          }`);
  lines.push(`          return obj;`);
  lines.push(`        }`);
  lines.push(``);
  lines.push(`        requestData = deepClean(requestData);`);

  const updated = content.replace(/(\btry\s*{)/, `$1\n${lines.join("\n")}`);

  fs.writeFileSync(filePath, updated, "utf8");
  console.log("Injected field parameters");
}
