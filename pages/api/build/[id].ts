import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../client';
import { build, test_occurrence } from '@prisma/client';
import { stripFailedFromClassName } from '../../../lambda/src/utils';
import omit from '../../../utils/omit';
import { TestOccurrence } from 'teamcity-client';
import moment from 'moment';
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

export type GetBuildTableDataResponseType = { name: string; duration: string; order: string, displayName: string };
export type GetBuildResponseType = build & {
    ignored: GetBuildTableDataResponseType[];
    passed_first_execution: GetBuildTableDataResponseType[];
    passed_rerun: GetBuildTableDataResponseType[];
    passed_both_executions: GetBuildTableDataResponseType[];
    double_failures: GetBuildTableDataResponseType[];
    single_failures: GetBuildTableDataResponseType[];
};

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
    const ignored = Object.entries(
        build.test_occurrence
            .filter(x => x.ignored)
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
    ).map(([_, test]) => ({
        name: _,
        duration: formatDuration(test[0].duration, true),
        order: `${test[0].order}`,
        displayName: test[0].test_class_name.split('.').slice(-2).join('.')
    }));
    const testNamesAndStatuses = Object.entries(
        build.test_occurrence
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
    const passed_rerun = testNamesAndStatuses
        .filter(([_, statuses]) => statuses.length > 1)
        .filter(
            ([_, statuses]) => statuses[0].status === 'FAILURE' && statuses[1].status === 'SUCCESS'
        )
        .map(([_, test]) => ({
            name: _,
            duration: formatDuration(test[1].duration,true),
            order: `${test[0].order}/${test[1].order}`,
            displayName: test[0].test_class_name.split('.').slice(-2).join('.')
        }));
    const passed_first_execution = testNamesAndStatuses
        .filter(([_, statuses]) => statuses.length == 1 && statuses[0].status === 'SUCCESS')
        .map(([_, test]) => ({
            name: _,
            duration: formatDuration(test[0].duration, true),
            order: `${test[0].order}`,
            displayName: test[0].test_class_name.split('.').slice(-2).join('.')
        }));
    const single_failures = testNamesAndStatuses
        .filter(([_, statuses]) => statuses.length == 1 && statuses[0].status === 'FAILURE')
        .map(([_, test]) => ({
            name: _,
            duration: formatDuration(test[0].duration, true),
            order: `${test[0].order}`,
            displayName: test[0].test_class_name.split('.').slice(-2).join('.')
        }));
    const passed_both_executions = testNamesAndStatuses
        .filter(
            ([_, statuses]) =>
                statuses.length == 2 &&
                statuses[0].status === 'SUCCESS' &&
                statuses[1].status === 'SUCCESS'
        )
        .map(([_, test]) => ({
            name: _,
            duration: formatDuration(test[1].duration, true),
            order: `${test[0].order}/${test[1].order}`,
            displayName: test[0].test_class_name.split('.').slice(-2).join('.')
        }));

    const double_failures = testNamesAndStatuses
        .filter(
            ([_, statuses]) =>
                statuses.length == 2 &&
                statuses[0].status === 'FAILURE' &&
                statuses[1].status === 'FAILURE'
        )
        .map(([_, test]) => ({
            name: _,
            duration: formatDuration(test[1].duration, true),
            order: `${test[0].order}/${test[1].order}`,
            displayName: test[0].test_class_name.split('.').slice(-2).join('.')
        }));

    const response: GetBuildResponseType = {
        ...build,
        passed_first_execution,
        passed_rerun,
        single_failures,
        ignored,
        passed_both_executions,
        double_failures: double_failures,
    };
    const except = build.test_occurrence.filter(
        x =>
            !passed_first_execution.find(y => y.name == x.test_class_name) &&
            !passed_rerun.find(y => y.name == x.test_class_name) &&
            !single_failures.find(y => y.name == x.test_class_name) &&
            !ignored.find(y => y.name == x.test_class_name) &&
            !passed_both_executions.find(y => y.name == x.test_class_name)
    );
    console.log(except);
    return res.json(response);
}
