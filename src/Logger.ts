import * as fs from "fs"
import { dirname } from "path"
import { isPlainObject, PlainObjectType } from "./util"
import { mkdirIfNotExists, colorize, uncolorize } from "./node-util"

export class Logger {
	stream: fs.WriteStream

	constructor(readonly path: string) {
		this.path = Logger.parseLogPath(path)
	}

	static parseLogPath(path: string) {
		const date = new Date()
		path = path.replace(`{year}`, date.getFullYear().toString())
		path = path.replace(
			`{month}`,
			date.getMonth().toString().padStart(2, "0")
		)
		path = path.replace(`{day}`, date.getDate().toString().padStart(2, "0"))
		return path
	}

	async init() {
		await mkdirIfNotExists(dirname(this.path))
		this.stream = fs.createWriteStream(this.path, {
			flags: "a",
			encoding: "utf-8",
		})
	}

	writeBuffer(data: Buffer) {
		console.log(data.toString())
		this.stream.write(data.toString())
	}

	writePlainObject(data: PlainObjectType) {
		for (const key in data) {
			const line = `# ${colorize("yellow", key)}: ${data[key]}`
			this.write(line)
		}
	}
	write(data: unknown, consoleLog = true) {
		if (data instanceof Buffer) {
			this.writeBuffer(data)
		} else if (isPlainObject(data)) {
			this.writePlainObject(data)
		} else {
			if (consoleLog) console.log(data)
			this.stream.write(`${uncolorize(String(data))}\n`)
		}
	}

	async end() {
		return new Promise((resolve) => this.stream.end(resolve))
	}
}
