export default function pick<T, K extends keyof T>(obj: T | T[], ...fields: K[]): Pick<T, K> | Pick<T, K>[] {
    if (Array.isArray(obj)) {
        const results = [] as Pick<T, K>[];
        for (const o of obj) {
            const result = {} as Pick<T, K>;
            for (const field of fields) {
                result[field] = o[field];
            }
            results.push(result);
        }
        return results;
    } else {
        const result = {} as Pick<T, K>;
        for (const field of fields) {
            result[field] = obj[field];
        }
        return result;
    }
};