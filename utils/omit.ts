export default function omit<T, K extends keyof T>(obj: T, ...fields: K[]): Pick<T, Exclude<keyof T, K>> {
    return fields.reduce((result, field) => {
        const { [field]: _, ...rest } = obj;
        return rest;
    }, {} as Pick<T, Exclude<keyof T, K>>);
}
