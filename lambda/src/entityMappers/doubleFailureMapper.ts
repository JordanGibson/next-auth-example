import type { TestOccurrences } from 'teamcity-client';
import { stripFailedFromClassName } from '../utils';
import { TestOccurrence } from 'teamcity-client';
import StatusEnum = TestOccurrence.StatusEnum;
import {hasTestOccurrences} from "./testOccurrenceMapper";

export default function mapResponseToDoubleFailureEntities(response: TestOccurrences) {
    if (!hasTestOccurrences(response)) {
        return [];
    }
    return Object.entries(
        response.testOccurrence
            .filter(x => x.status === StatusEnum.FAILURE)
            .map(x => stripFailedFromClassName(x.name))
            .reduce(getTestToFailureCountReducer(), {})
    )
        .filter(([_, value]) => value > 1)
        .flatMap(x => x[0])
        .map(x => ({
            test_class_name: x,
        }));
}

function getTestToFailureCountReducer() {
    return (acc: { [testName: string]: number }, test_name) => {
        if (!acc[test_name]) {
            acc[test_name] = 1;
        } else {
            acc[test_name]++;
        }
        return acc;
    };
}
