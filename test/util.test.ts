import { parseStringList } from "./../src/util"

beforeEach(() => {
	jest.clearAllMocks()
})

describe(parseStringList.name, () => {
	it("basic", () => {
		expect(parseStringList("1,2,3")).toMatchObject(["1", "2", "3"])
		expect(parseStringList("a, b , c")).toMatchObject(["a", "b", "c"])
	})
})
