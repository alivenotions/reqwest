export function deepMerge(target: any, source: any) {
  const isObject = (obj: any) => obj && typeof obj === 'object'

  if (!isObject(target) || !isObject(source)) {
    return source
  }

  let newObject = { ...target }
  Object.keys(source).forEach(key => {
    const targetValue = newObject[key]
    const sourceValue = source[key]

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      newObject[key] = targetValue.concat(sourceValue)
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      newObject[key] = deepMerge(Object.assign({}, targetValue), sourceValue)
    } else {
      newObject[key] = sourceValue
    }
  })

  return newObject
}
