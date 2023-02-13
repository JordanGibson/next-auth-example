import type {TestOccurrence, TestOccurrences} from "teamcity-client";
import {stripFailedFromClassName} from "../utils";
import type {Prisma} from "@prisma/client";


export default function mapTestOccurrencesToEntities(testOccurrences: TestOccurrences): Prisma.test_occurrenceCreateManyBuildInput[] {
    return hasTestOccurrences(testOccurrences) ? testOccurrences.testOccurrence.map(mapTestOccurrenceToEntity): [];
}

export const hasTestOccurrences = (testOccurrences: TestOccurrences) => testOccurrences.count && testOccurrences.count >= 1;
export function mapTestOccurrenceToEntity(testOccurrence: TestOccurrence): Prisma.test_occurrenceCreateManyBuildInput {
    return ({
        id: testOccurrence.id,
        test_class_name: stripFailedFromClassName(testOccurrence.name),
        status: testOccurrence.status.toString(),
        duration: testOccurrence.duration ?? 0,
        href: testOccurrence.href,
        ignored: testOccurrence.ignored ?? false,
    });
}