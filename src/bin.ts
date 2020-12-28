#!/usr/bin/env node
import { program } from "commander"
import { homedir } from "os"
import { delimiter, join, normalize, relative } from "path"
import { parseStringList } from "./util"
import { Logger } from "./Logger"
import { ARestic } from "./ARestic"
import { AResticError } from "./AResticError"
import { colorize, glob } from "./node-util"
import * as dayjs from "dayjs"
import * as customParseFormat from "dayjs/plugin/customParseFormat"

dayjs.extend(customParseFormat)

export type GlobalOptionsType = {
	configPath: string
}

export type BackupOptionsType = {
	logPath: string
	names: string[]
}

const configBaseName = ARestic.name.toLowerCase()
const globalConfigPath = join(homedir(), `${configBaseName}.{json,yaml,yml}`)
const localConfigPath = relative(
	process.cwd(),
	join(process.cwd(), `${configBaseName}.{json,yaml,yml}`)
)

const configPath = [localConfigPath, globalConfigPath].join(delimiter)

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

			const backups = restic.config.backups.filter(
				(backup) =>
					!options.names || options.names.includes(backup.name)
			)

			if (!backups.length)
				throw new AResticError(`Backup configs are empty`)

			for (const backup of backups)
				if (backup.regexDateFormat && !backup.snapshotByPath)
					throw new AResticError(
						`'regexDateFormat' option requires to enable 'snapshotByPath'`
					)

			let backupsCounter = 0

			for (let backup of backups) {
				for (const repositoryName of backup.repositories) {
					const repository = restic.config.repositories.find(
						(repository) => repository.name === repositoryName
					)

					const existsRepository = await restic.existsRepository(
						repository,
						backup
					)

					if (!existsRepository) {
						const endTimeObject = await logger.startTimeObject(
							"init",
							{
								configPath: restic.configPath,
								backupName: backup.name,
								repositoryName: repository.name,
								repository: ARestic.formatRepository(
									repository,
									true
								),
							}
						)
						const exitCode = await restic.initRepository(
							repository,
							backup
						)
						await endTimeObject({
							exitCode: exitCode,
						})
						await logger.writeSeparator()
					}

					let pathsCounter = 0

					const pathRegexes = backup.pathRegexes?.map(
						(regex) => new RegExp(regex)
					)

					const pathMatches: Record<
						string,
						Record<string, string>
					> = {}

					const paths = (backup.paths || [])
						.concat(
							...(await glob(backup.pathGlobs || [], {
								absolute: true,
							}))
						)
						.map((path) => normalize(path))
						.filter((path) => {
							if (!pathRegexes) return true
							for (const regex of pathRegexes) {
								const matches = regex.exec(path)
								if (matches) {
									pathMatches[path] = matches.groups
									return true
								}
							}
							return false
						})

					const pathsGroups = backup.snapshotByPath
						? paths.map((path) => [path])
						: [paths]

					for (const paths of pathsGroups) {
						const endTimeObject = await logger.startTimeObject(
							"backup",
							{
								configPath: restic.configPath,
								backupName: backup.name,
								backupPath: backup.snapshotByPath
									? paths[0]
									: undefined,
								repositoryName: repository.name,
								repository: ARestic.formatRepository(
									repository,
									true
								),
							}
						)

						console.log("")

						if (backup.regexDateFormat) {
							const path = paths[0]
							const dateStr = pathMatches[path]?.["date"]

							if (!dateStr)
								throw new AResticError(
									`'regexDateFormat' require the 'date' regular expression capture`
								)

							const dateInstace = dayjs(
								dateStr,
								backup.regexDateFormat,
								true
							)

							if (!dateInstace.isValid())
								throw new AResticError(
									`Date and format are not valid: ${dateStr}, ${backup.regexDateFormat}`
								)

							backup = Object.assign({}, backup)
							backup.options = Object.assign(
								{},
								backup.options || {}
							)
							backup.options.time = dateInstace.format(
								"YYYY-MM-DD HH:mm:ss"
							)
						}

						const exitCode = await restic.backup(
							backup,
							repository,
							paths,
							(data) => logger.write(data)
						)

						await endTimeObject({
							exitCode: exitCode,
						})

						exitCodes.push(exitCode)

						backupsCounter++
						pathsCounter++
						await logger.writeSeparator(
							!!backups[backupsCounter] ||
								!!pathsGroups[pathsCounter]
						)
					}
				}
			}

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
