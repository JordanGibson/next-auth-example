import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../client';
import { build, build_details, test_occurrence } from '@prisma/client';
import { stripFailedFromClassName } from '../../../lambda/src/utils';
import { formatDuration } from '../../../utils/timeUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            await get(req, res);
            break;
        default:
            res.setHeader('Allow', ['GET', 'PUT']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export type GetBuildTableDataResponseType = {
    name: string;
    duration: string[];
    order: number[];
    displayName: string;
};
export type GetBuildResponseType = build & {
    ignored: GetBuildTableDataResponseType[];
    passed_first_execution: GetBuildTableDataResponseType[];
    passed_rerun: GetBuildTableDataResponseType[];
    passed_both_executions: GetBuildTableDataResponseType[];
    double_failures: GetBuildTableDataResponseType[];
    single_failures: GetBuildTableDataResponseType[];
    other: GetBuildTableDataResponseType[];
};

function groupTestOccurrencesByName(
    test_occurrences: test_occurrence[]
): [string, test_occurrence[]][] {
    return Object.entries(
        test_occurrences
            .map(x => ({
                ...x,
                test_class_name: stripFailedFromClassName(x.test_class_name),
            }))
            .reduce((acc: { [test: string]: test_occurrence[] }, test: test_occurrence) => {
                if (!acc[test.test_class_name]) {
                    acc[test.test_class_name] = [test];
                } else {
                    acc[test.test_class_name].push(test);
                }
                return acc;
            }, {})
    );
}

async function get(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const build = await prisma.build.findUnique({
        where: {
            id: parseInt(id as string),
        },
        include: {
            build_details: true,
            test_occurrence: true,
        },
    });
    if (build == null) {
        return res.status(404).send(`Failed to find build with id ${id}`);
    }
    console.log('Test Occurrences from DB:' + build.test_occurrence.length);
    const occurrencesByName = groupTestOccurrencesByName(build.test_occurrence);
    const ignored = getTestOccurrencesForCriteria(
        occurrencesByName.filter(([, occurrences]) => {
            return occurrences.some(x => x.ignored);
        })
    );
    const passed_rerun = getTestOccurrencesForCriteria(occurrencesByName, {
        times: 2,
        status: 'FAILURE',
        statusRerun: 'SUCCESS',
    });
    const passed_first_execution = getTestOccurrencesForCriteria(occurrencesByName, {
        times: 1,
        status: 'SUCCESS',
    });
    const single_failures = getTestOccurrencesForCriteria(occurrencesByName, {
        times: 1,
        status: 'FAILURE',
    });
    const passed_both_executions = getTestOccurrencesForCriteria(occurrencesByName, {
        times: 2,
        status: 'SUCCESS',
        statusRerun: 'SUCCESS',
    });
    const double_failures = getTestOccurrencesForCriteria(occurrencesByName, {
        times: 2,
        status: 'FAILURE',
        statusRerun: 'FAILURE',
    });
    const other = groupTestOccurrencesByName(
        build.test_occurrence.filter(
            x =>
                !passed_first_execution.find(y => y.name == x.test_class_name) &&
                !passed_rerun.find(y => y.name == x.test_class_name) &&
                !single_failures.find(y => y.name == x.test_class_name) &&
                !ignored.find(y => y.name == x.test_class_name) &&
                !passed_both_executions.find(y => y.name == x.test_class_name) &&
                !double_failures.find(y => y.name == x.test_class_name)
        )
    ).map(([testName, occurrences]) => ({
        name: testName,
        duration: occurrences.map(x => formatDuration(x.duration, true)),
        order: occurrences.map(x => x.order),
        displayName: occurrences[0].test_class_name.split('.').slice(-2).join('.'),
    }));
    const response: GetBuildResponseType = {
        ...build,
        passed_first_execution,
        passed_rerun,
        single_failures,
        ignored,
        other,
        passed_both_executions,
        double_failures: double_failures,
    };
    console.log(other.length);
    return res.json(response);
}

function getTestOccurrencesForCriteria(
    testNamesAndOccurrences: [string, test_occurrence[]][],
    filterParams?: {
        times?: number;
        status?: string;
        statusRerun?: string;
    }
): GetBuildTableDataResponseType[] {
    return testNamesAndOccurrences
        .filter(
            ([_, occurrences]) =>
                (filterParams?.times ? occurrences.length == filterParams.times : true) &&
                (filterParams?.status ? occurrences[0].status == filterParams.status : true) &&
                (filterParams?.statusRerun && filterParams?.times && filterParams.times > 1
                    ? occurrences[1].status == filterParams.statusRerun
                    : true)
        )
        .map(([testName, occurrences]) => ({
            name: testName,
            duration: occurrences.map(x => formatDuration(x.duration, true)),
            order: occurrences.map(x => x.order),
            displayName: occurrences[0].test_class_name.split('.').slice(-2).join('.'),
        }));
}
