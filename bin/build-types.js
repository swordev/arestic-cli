const { join } = require("path")
const { writeFileSync } = require("fs")
const { compileFromFile } = require("json-schema-to-typescript")

const schemaPath = join(__dirname, "..", "arestic.schema.json")
const typePath = join(__dirname, "..", "src", "AResticSchema.d.ts")

compileFromFile(schemaPath).then((ts) => writeFileSync(typePath, ts))
