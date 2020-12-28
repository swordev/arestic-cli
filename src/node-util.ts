import { promises as fs } from "fs"
import { spawn, SpawnOptions } from "child_process"
import { F_OK } from "constants"
import { inspect } from "util"
import { safeLoad } from "js-yaml"
import * as Ajv from "ajv"
import * as FastGlob from "fast-glob"
import type { GlobOptions } from "./AResticSchema"

export async function checkPath(path: string) {
	try {
		await fs.access(path, F_OK)
		return true
	} catch (error) {
		return false
	}
}

export async function parseJSONFile(path: string) {
	const contents = await fs.readFile(path)
	return JSON.parse(contents.toString()) as never
}

export async function parseYAMLFile(path: string) {
	const contents = await fs.readFile(path)
	return safeLoad(contents.toString()) as never
}

export function validateJsonSchema(data: unknown, schemaPath: string) {
	const ajv = new Ajv()
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const schema = require(schemaPath)
	const validate = ajv.compile(schema)
	return validate(data) ? [] : validate.errors
}

export async function mkdirIfNotExists(path: string) {
	try {
		await fs.mkdir(path, {
			recursive: true,
		})
	} catch (e) {
		return
	}
}

export async function exec(
	command: string,
	args: string[],
	options?: SpawnOptions,
	onData?: (data: Buffer) => void
) {
	return new Promise<number>((resolve, reject) => {
		const childProcess = spawn(
			command,
			args,
			Object.assign(
				{
					stdio: ["inherit", "pipe", "pipe"],
				} as SpawnOptions,
				options
			)
		)
		if (onData) {
			childProcess.stdout.on("data", (chunk) => onData(chunk))
			childProcess.stderr.on("data", (chunk) => onData(chunk))
		}
		childProcess.on("error", reject)
		childProcess.on("close", (exitCode) => resolve(exitCode))
	})
}

export function colorize(color: string, text: string) {
	const codes = inspect.colors[color]
	return `\x1b[${codes[0]}m${text}\x1b[${codes[1]}m`
}

/**
 * @link https://github.com/chalk/ansi-regex/blob/master/index.js#L3
 */
export function uncolorize(text: string) {
	return text.replace(
		// eslint-disable-next-line no-control-regex
		/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
		""
	)
}

export async function glob(
	input: (string | GlobOptions)[],
	defaultOptions?: FastGlob.Options
) {
	const patterns: string[] = []
	const paths: string[] = []

	for (const patternOrOptions of input) {
		if (typeof patternOrOptions === "string") {
			patterns.push(patternOrOptions)
		} else {
			paths.push(
				...(await FastGlob(
					patternOrOptions.patterns,
					Object.assign(
						{},
						defaultOptions,
						patternOrOptions
					) as FastGlob.Options
				))
			)
		}
	}

	if (patterns.length)
		paths.push(...(await FastGlob(patterns, defaultOptions)))

	return paths
}
