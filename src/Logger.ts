import * as fs from "fs"
import { dirname } from "path"
import { isPlainObject, PlainObjectType } from "./util"
import { mkdirIfNotExists, colorize, uncolorize } from "./node-util"
import { randomBytes } from "crypto"

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

	async writeBuffer(data: Buffer) {
		return await this.write(data.toString(), false)
	}

	async writePlainObject(data: PlainObjectType) {
		for (const key in data) {
			const line = `# ${colorize("yellow", key)}: ${data[key]}`
			await this.write(line)
		}
	}

	async writeSeparator(consoleLog = true) {
		return await this.write(
			"\n" + colorize("grey", "#".repeat(64) + "\n"),
			true,
			consoleLog
		)
	}

	async startTimeObject(tag: string, data: PlainObjectType) {
		const startDate = new Date()
		const actionId = randomBytes(4).toString("hex")

		const writeTag = async (type: string, close?: boolean) =>
			await this.write(
				"# " +
					colorize(
						"cyan",
						`<${close ? "/" : ""}${tag}${
							type.slice(0, 1).toUpperCase() + type.slice(1)
						}>`
					)
			)

		await writeTag("start")
		await this.write(
			Object.assign(
				{
					actionId: actionId,
					date: startDate.toISOString(),
				},
				data
			)
		)
		await writeTag("start", true)

		return async (data: PlainObjectType) => {
			const endDate = new Date()
			await writeTag("end")
			await this.write(
				Object.assign(
					{
						actionId: actionId,
						date: endDate.toISOString(),
						elapsedTime: `${
							endDate.getTime() - startDate.getTime()
						}ms`,
					},
					data
				)
			)
			await writeTag("end", true)
		}
	}

	async write(data: unknown, lineSalt = true, consoleLog = true) {
		if (data instanceof Buffer) {
			return await this.writeBuffer(data)
		} else if (isPlainObject(data)) {
			return await this.writePlainObject(data)
		} else {
			if (consoleLog) console.log(data)
			return new Promise((resolve) => {
				this.stream.write(
					`${uncolorize(String(data))}${lineSalt ? "\n" : ""}`,
					resolve
				)
			})
		}
	}

	async end() {
		return new Promise((resolve) => this.stream.end(resolve))
	}
}
