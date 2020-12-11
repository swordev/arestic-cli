export type PlainObjectType = Record<string, unknown>

export function isPlainObject(value: unknown): value is PlainObjectType {
	return typeof value === "object" && !!value
}

export function parseStringList(value: string) {
	return value.split(",").map((v) => v.trim())
}

export function findDuplicates<T>(values: T[]): T[] {
	return values.filter(
		(value, index, newValues) => newValues.indexOf(value) !== index
	)
}

export function recordToArray<T extends unknown>(
	record: Record<string, T>,
	recordKey: keyof T
) {
	const result: T[] = []
	for (const key in record) {
		result.push(
			Object.assign({}, record[key], {
				[recordKey]: key,
			})
		)
	}
	return result
}

export function expandBraces(value: string) {
	const result: string[] = []
	value.replace(/(?:\{(.+)\})/g, (group, groupValues) => {
		for (const groupValue of groupValues.split(",")) {
			result.push(value.replace(group, groupValue))
		}
		return null
	})

	if (!result.length) result.push(value)
	return result
}

export function parseArgs(data: Record<string, unknown>) {
	const args = []
	for (const key in data) {
		const value = data[key]
		if (Array.isArray(value)) {
			for (const itemValue of value) args.push(`--${key}`, itemValue)
		} else if (typeof value === "boolean") {
			if (value) args.push(`--${key}`)
		} else if (value !== null) {
			args.push(`--${key}`, value)
		}
	}
	return args
}
