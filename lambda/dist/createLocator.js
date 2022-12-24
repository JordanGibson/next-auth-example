export function createLocator(args) {
    const createValue = (value) => `(${typeof value === "string" ? `${value}` : createLocator(value)})`;
    return Object.keys(args)
        .map((key) => `${key}:${createValue(args[key])}`)
        .join(",");
}
