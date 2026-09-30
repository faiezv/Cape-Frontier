import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";

const ROOT = process.cwd();

const IGNORE = new Set([
  "node_modules",
  "dist",
  ".git",
  ".vercel",
]);

const EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
]);

const nodes = [];
const edges = [];

function getFiles(dir) {
  const entries = fs.readdirSync(dir, {
    withFileTypes: true,
  });

  const files = [];

  for (const entry of entries) {
    if (IGNORE.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getFiles(fullPath));
      continue;
    }

    if (EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function relative(file) {
  return path
    .relative(ROOT, file)
    .replaceAll("\\", "/");
}

function nodeId(file) {
  return relative(file);
}

function findImportPath(importPath, currentFile) {
  if (!importPath.startsWith(".")) {
    return null;
  }

  const base = path.resolve(
    path.dirname(currentFile),
    importPath
  );

  // Only treat JavaScript/TypeScript files as code dependencies.
  const possibilities = [
    base,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, "index.js"),
    path.join(base, "index.jsx"),
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ];

  for (const file of possibilities) {
    if (
      fs.existsSync(file) &&
      fs.statSync(file).isFile() &&
      EXTENSIONS.has(path.extname(file))
    ) {
      return file;
    }
  }

  return null;
}

function parseImports(file) {
  const code = fs.readFileSync(file, "utf8");

  let ast;

  try {
    ast = parse(code, {
      sourceType: "unambiguous",
      plugins: [
        "jsx",
        "typescript",
      ],
    });
  } catch (error) {
    console.warn(`Could not parse ${relative(file)}`);
    return [];
  }

  const imports = [];

  for (const node of ast.program.body) {
    if (node.type === "ImportDeclaration") {
      imports.push(node.source.value);
    }

    if (
      node.type === "ExportNamedDeclaration" &&
      node.source
    ) {
      imports.push(node.source.value);
    }

    if (
      node.type === "ExportAllDeclaration" &&
      node.source
    ) {
      imports.push(node.source.value);
    }
  }

  return imports;
}

const files = getFiles(ROOT);

for (const file of files) {
  const id = nodeId(file);

  nodes.push({
    id,
    type: "default",
    data: {
      label: path.basename(file),
      path: relative(file),
    },
    position: {
      x: 0,
      y: 0,
    },
  });
}

for (const file of files) {
  const imports = parseImports(file);

  for (const importPath of imports) {
    const target = findImportPath(importPath, file);

    if (!target) continue;

    edges.push({
      id: `${nodeId(file)}->${nodeId(target)}`,
      source: nodeId(file),
      target: nodeId(target),
      type: "smoothstep",
    });
  }
}

const graph = {
  nodes,
  edges,
};

fs.writeFileSync(
  path.join(ROOT, "src/projectGraph.json"),
  JSON.stringify(graph, null, 2)
);

console.log(
  `Scanned ${nodes.length} files and found ${edges.length} relationships.`
);
