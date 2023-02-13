import {createLocator} from "./createLocator";

export const buildsForSuite = (suiteId: string): string => createLocator({
    buildType: {
        id: suiteId,
    },
    branch: {
        default: 'false',
    },
    defaultFilter: 'false',
    count: '5000',
})
export const buildWithIdAndCount = (buildId: number): string => createLocator({
    build: {
        id: String(buildId),
    },
    count: '10000',
})