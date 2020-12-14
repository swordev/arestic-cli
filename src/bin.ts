#!/usr/bin/env node
import { program } from "commander"
import { homedir } from "os"
import { delimiter, join, relative } from "path"
import { parseStringList, PlainObjectType } from "./util"
import { Logger } from "./Logger"
import { ARestic } from "./ARestic"
import { AResticError } from "./AResticError"
import { colorize } from "./node-util"

export type GlobalOptionsType = {
	configPath: string
}

export type BackupOptionsType = {
	logPath: string
	names: string[]
}

const configBaseName = ARestic.name.toLowerCase()
const localConfigPath = relative(
	process.cwd(),
	join(process.cwd(), `${configBaseName}.{json,yaml,yml}`)
)

const configPath = [localConfigPath].join(delimiter)

program.option("-c, --config-path <value>", "Config path", configPath)

program
	.command("parse")
	.description("Parse config")
	.action(
		onCommandAction(async () => {
			const globalOptions = getGlobalOptions()
			const restic = new ARestic()
			await restic.loadConfig(globalOptions.configPath)
			console.log(JSON.stringify(restic.config, null, 2))
		})
	)

program
	.command("backup")
	.description("Create backups")
	.option(
		"-l, --log-path <value>",
		"Log path",
		join(
			homedir(),
			`.${configBaseName}`,
			"logs",
			"backups-{year}-{month}.log"
		)
	)
	.option<string[]>(
		"-n, --names <values>",
		"Backup names",
		parseStringList,
		null
	)
	.action(
		onCommandAction(async (options: BackupOptionsType) => {
			const globalOptions = getGlobalOptions()
			const exitCodes: number[] = []
			const restic = new ARestic()
			const logger = new Logger(options.logPath)

			await logger.init()
			await restic.loadConfig(globalOptions.configPath)

			let backups = 0

			if (options.names) {
				const unfoundBackups = options.names.filter(
					(name) =>
						!restic.config.backups.some(
							(backup) => backup.name === name
						)
				)
				if (unfoundBackups.length)
					throw new AResticError(
						`Backup configs not founds: ${unfoundBackups.join(
							", "
						)}`
					)
			}

			for (const backup of restic.config.backups) {
				if (options.names && !options.names.includes(backup.name))
					continue

				for (const repositoryName of backup.repositories) {
					const repository = restic.config.repositories.find(
						(repository) => repository.name === repositoryName
					)

					const existsRepository = await restic.existsRepository(
						repository,
						backup.password
					)

					if (!existsRepository)
						await restic.initRepository(repository, backup.password)

					const startDate = new Date()

					logger.write(
						"\n" + colorize("grey", "#".repeat(64)) + "\n",
						backups > 0
					)

					const startLogData: PlainObjectType = {
						date: startDate.toISOString(),
						configPath: restic.configPath,
						backupName: backup.name,
						repositoryName: repository.name,
						repository: ARestic.formatRepository(repository, true),
					}

					if (!existsRepository) startLogData["new"] = true

					logger.write(startLogData)
					logger.write("")

					const exitCode = await restic.backup(
						backup,
						repository,
						(data) => logger.write(data)
					)

					exitCodes.push(exitCode)

					const endDate = new Date()

					logger.write({
						date: endDate.toISOString(),
						exitCode: exitCode,
						execTime: `${
							endDate.getTime() - startDate.getTime()
						}ms`,
					})
					backups++
				}
			}

			if (!backups) throw new AResticError(`Backup configs are empty`)

			await logger.end()

			if (!exitCodes.length || exitCodes.some((v) => v)) process.exit(1)
		})
	)

program.parse(process.argv)

function getGlobalOptions(): GlobalOptionsType {
	return program.opts() as never
}

function onCommandAction(cb: (options: unknown) => Promise<void>) {
	return async function (options: unknown) {
		try {
			await cb(options)
		} catch (error) {
			const e: Error = error
			let text: string
			if (error instanceof AResticError) {
				text = e.message
			} else {
				text = e.stack
			}
			console.error(colorize("red", text))
			process.exit(1)
		}
	}
}
