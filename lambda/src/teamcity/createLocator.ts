type CreateLocatorArgs = {
  [key: string]: string | CreateLocatorArgs;
};
export function createLocator(args: CreateLocatorArgs): string {
  const createValue = (value: string | CreateLocatorArgs): string =>
    `(${typeof value === "string" ? `${value}` : createLocator(value)})`;
  return Object.keys(args)
    .map((key) => `${key}:${createValue(args[key])}`)
    .join(",");
}
