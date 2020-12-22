import {
	expandBraces,
	findDuplicates,
	isPlainObject,
	parseArgs,
	parseStringList,
	recordToArray,
} from "./../src/util"

beforeEach(() => {
	jest.clearAllMocks()
})

describe(expandBraces.name, () => {
	test("two values", () => {
		expect(expandBraces("prefix.{a,b}")).toMatchObject([
			"prefix.a",
			"prefix.b",
		])
	})
})

describe(findDuplicates.name, () => {
	test("one duplicated", () => {
		expect(findDuplicates(["value1", "value2", "value1"])).toMatchObject([
			"value1",
		])
	})
	test("no duplicates", () => {
		expect(findDuplicates(["value1", "value2"])).toMatchObject([])
	})
})

describe(isPlainObject.name, () => {
	test("truthy", () => {
		expect(isPlainObject({})).toBeTruthy()
		expect(isPlainObject(Object.create({}))).toBeTruthy()
		expect(isPlainObject(new Object())).toBeTruthy()
	})
	test("falsy", () => {
		expect(isPlainObject(new String())).toBeFalsy()
		expect(isPlainObject(new Boolean())).toBeFalsy()
		expect(isPlainObject(undefined)).toBeFalsy()
		expect(isPlainObject(null)).toBeFalsy()
		expect(isPlainObject("value")).toBeFalsy()
	})
})

describe(parseArgs.name, () => {
	test("mixed values", () => {
		expect(
			parseArgs({
				key1: "key1",
				enabled: true,
				notEnabled: false,
				items: ["value1", "value2"],
			})
		).toMatchObject([
			"--key1",
			"key1",
			"--enabled",
			"--items",
			"value1",
			"--items",
			"value2",
		])
	})
})

describe(parseStringList.name, () => {
	test("number list", () => {
		expect(parseStringList("1,2,3")).toMatchObject(["1", "2", "3"])
	})
	test("string list with spaces", () => {
		expect(parseStringList("a, b , c")).toMatchObject(["a", "b", "c"])
	})
})

describe(recordToArray.name, () => {
	test("two objects", () => {
		expect(
			recordToArray(
				{
					name1: {
						name: null,
						value1: "value1",
					},
					name2: {
						name: null,
						value2: "value2",
					},
				},
				"name"
			)
		).toMatchObject([
			{
				name: "name1",
				value1: "value1",
			},
			{
				name: "name2",
				value2: "value2",
			},
		])
	})
})
