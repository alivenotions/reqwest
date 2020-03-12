import { deepMerge } from '../src/deep-merge'

const first = {
  a: {
    b: {
      c: 1,
    },
    d: 2,
  },
  e: 3,
}

const second = {
  a: {
    b: {
      f: 4,
    },
  },
}

describe('deep-merge', () => {
  it('should deep merge the two objects', () => {
    const expectedOutput = {
      a: {
        b: {
          c: 1,
          f: 4,
        },
        d: 2,
      },
      e: 3,
    }

    expect(deepMerge(first, second)).toEqual(expectedOutput)
  })

  it('should return the source if the either is undefined', () => {
    expect(deepMerge(undefined, second)).toEqual(second)
    expect(deepMerge(first, undefined)).toEqual(undefined)
    expect(deepMerge(undefined, undefined)).toEqual(undefined)
  })
})
