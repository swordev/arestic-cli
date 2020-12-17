import { delimiter, normalize, resolve } from "path"
import {
	expandBraces,
	findDuplicates,
	isPlainObject,
	parseArgs,
	recordToArray,
} from "./util"
import {
	checkPath,
	exec,
	mkdirIfNotExists,
	parseJSONFile,
	parseYAMLFile,
	validateJsonSchema,
} from "./node-util"
import { AResticError } from "./AResticError"
import type * as Schema from "./AResticSchema"
import { promises as fs } from "fs"

export type ConfigType<TNormalized extends boolean = true> = {
	repositories: TNormalized extends true
		? Schema.Repository[]
		: Record<string, Schema.Repository> | Schema.Repository[]
	backups: TNormalized extends true
		? Schema.Backup[]
		: Record<string, Schema.Backup> | Schema.Backup[]
}

export class ARestic {
	configPath: string
	config: ConfigType

	static formatRepository(input: Schema.Repository, hidePassword?: boolean) {
		if (input.backend === "local") {
			if (typeof input.path !== "string")
				throw new AResticError(
					`Invalid path at "${input.name}" repository: ${input.path}`
				)
			return normalize(input.path)
		}
		let url = `${input.backend}:`
		url += `${input.protocol}://`
		if (input.username) {
			url += `${input.username}`
			if (input.password)
				url += `:${hidePassword ? "********" : input.password}`
			url += `@`
		}
		if (input.host) url += input.host
		if (input.port) url += `:${input.port}`
		if (input.path) url += input.path
		return url
	}

	async loadConfig(path: string) {
		const paths = path
			.split(delimiter)
			.flatMap((value) => expandBraces(value))

		for (const value of paths) {
			if (await checkPath(value)) {
				path = value
				break
			}
		}

		path = resolve(path)

		let rawConfig: ConfigType<false>

		if (/\.ya?ml$/.test(path)) {
			rawConfig = await parseYAMLFile(path)
		} else {
			rawConfig = await parseJSONFile(path)
		}

		const errors = validateJsonSchema(rawConfig, "./../arestic.schema.json")

		if (errors.length)
			throw new AResticError(
				`Invalid json schema: ${path}\n${JSON.stringify(
					errors,
					null,
					2
				)}`
			)

		const config = await this.normalizeConfig(rawConfig)
		this.checkConfig(config)
		this.configPath = path
		this.config = config
	}

	protected async normalizeConfig(config: ConfigType<false>) {
		let repositories: Schema.Repository[] = Array.isArray(
			config.repositories
		)
			? config.repositories
			: isPlainObject(config.repositories)
			? recordToArray(config.repositories, "name")
			: []

		repositories = repositories.map((repository) => {
			repository = Object.assign({}, repository)
			if (repository.extends) {
				const repositoryBase = repositories.find(
					(repo) => repo.name === repository.extends
				)
				if (!repositoryBase)
					throw new AResticError(
						`Repository not found: ${repository.extends}`
					)
				repository = Object.assign({}, repositoryBase, repository)
			}
			return repository
		})

		for (const repository of repositories)
			if (repository.passwordPath)
				repository.password = (
					await fs.readFile(repository.passwordPath)
				).toString()

		const backups: Schema.Backup[] = Array.isArray(config.backups)
			? config.backups.slice(0).map((backup) => Object.assign({}, backup))
			: isPlainObject(config.backups)
			? recordToArray(config.backups, "name")
			: []

		for (const backup of backups)
			if (backup.passwordPath)
				backup.password = (
					await fs.readFile(backup.passwordPath)
				).toString()

		return {
			repositories: repositories,
			backups: backups,
		} as ConfigType
	}

	protected checkConfig(config: ConfigType) {
		const duplicatedRepositoryBackups = findDuplicates(config.repositories)

		if (duplicatedRepositoryBackups.length)
			throw new AResticError(
				`Duplicated repository names: ${duplicatedRepositoryBackups.join(
					", "
				)}`
			)

		const duplicatedBackupNames = findDuplicates(config.backups)
		if (duplicatedBackupNames.length)
			throw new AResticError(
				`Duplicated backup names: ${duplicatedBackupNames.join(", ")}`
			)

		for (const backup of config.backups) {
			const unfoundRepositoryNames = backup.repositories?.filter(
				(name) =>
					!config.repositories.find((repo) => repo.name === name)
			)
			if (unfoundRepositoryNames?.length)
				throw new AResticError(
					`Repository names not found at '${
						backup.name
					}' backup: ${unfoundRepositoryNames.join(", ")}`
				)
		}
	}

	protected buildEnv(repository: Schema.Repository, backup: Schema.Backup) {
		return Object.assign(
			{},
			process.env,
			{
				RESTIC_REPOSITORY: ARestic.formatRepository(repository),
				RESTIC_PASSWORD: backup.password,
			},
			repository.env || {},
			backup.env || {}
		)
	}

	async existsRepository(
		repository: Schema.Repository,
		backup: Schema.Backup
	) {
		const exitCode = await exec("restic", ["cat", "config"], {
			stdio: ["ignore", "pipe", "pipe"],
			env: this.buildEnv(repository, backup),
		})

		return exitCode === 0
	}

	async initRepository(repository: Schema.Repository, backup: Schema.Backup) {
		const RESTIC_REPOSITORY = ARestic.formatRepository(repository)

		if (repository.backend === "local")
			await mkdirIfNotExists(RESTIC_REPOSITORY)

		return await exec("restic", ["init"], {
			stdio: ["ignore", "pipe", "pipe"],
			env: this.buildEnv(repository, backup),
		})
	}

	async backup(
		data: Schema.Backup,
		repository: Schema.Repository,
		onExecData: (data: Buffer) => void
	) {
		const args = ["backup"]
			.concat(parseArgs(data.globalOptions || {}))
			.concat(data.paths)
			.concat(parseArgs(data.options))

		return await exec(
			"restic",
			args,
			{
				env: this.buildEnv(repository, data),
			},
			onExecData
		)
	}
}
