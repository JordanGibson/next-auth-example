import type {Prisma} from '@prisma/client';
import type {IndexedBuild} from './types';
import type {Build, TestOccurrence, TestOccurrences} from 'teamcity-client';
import moment from 'moment/moment';
import {getTenantFromBuildComment} from './tenant';
import prisma from './prisma';
import {stripFailedFromClassName} from './utils';
import mapResponseToTestOccurrenceEntities, {hasTestOccurrences} from "./entityMappers/testOccurrenceMapper";
import mapResponseToDoubleFailureEntities from "./entityMappers/doubleFailureMapper";
import mapBuildsToEntities from "./entityMappers/buildMapper";
import TeamcityFacade from "./teamcity/teamcityFacade";

export async function storeBuild({
    build,
    details,
    tenant,
    test_occurrences,
    double_failures,
}: Awaited<IndexedBuild>) {
    try {
        await prisma.build.upsert({
            where: {
                id: build.id,
            },
            create: {
                state: build.state,
                status: build.status,
                suite: {
                    connect: {
                        id: build.suite_id,
                    },
                },
                tenant: tenant
                    ? {
                          connectOrCreate: {
                              where: {
                                  id: tenant.id,
                              },
                              create: tenant,
                          },
                      }
                    : undefined,
                build_details: {
                    connectOrCreate: {
                        where: {
                            build_id: build.id,
                        },
                        create: details,
                    },
                },
                build_double_failure: {
                    createMany: {
                        data: double_failures,
                        skipDuplicates: true,
                    },
                },
                test_occurrence: {
                    createMany: {
                        data: test_occurrences,
                        skipDuplicates: true,
                    },
                },
            },
            update: {
                ...build,
            },
        });
    } catch (e) {
        console.log('during build', build);
        console.error(e);
    }
}

export async function getBuilds(suiteId: string): Promise<IndexedBuild[]> {
    const buildsResponse = await TeamcityFacade.getInstance().getAllBuildsForSuite(suiteId);
    const builds = mapBuildsToEntities(buildsResponse, suiteId);
    return await Promise.all(builds.map(indexBuild));
}

async function storeTestsFromOccurrences(
    testOccurrences: Array<TestOccurrence>,
    build: Prisma.buildCreateManyInput
) {
    await prisma.test.createMany({
        data: testOccurrences.map(
            (testOccurrence): Prisma.testCreateManyInput => ({
                class_name: stripFailedFromClassName(testOccurrence.name),
                suite_id: build.suite_id,
            })
        ),
        skipDuplicates: true,
    });
}

async function indexBuild(build: Prisma.buildCreateManyInput): Promise<IndexedBuild> {
    const buildResponse = await TeamcityFacade.getInstance().getBuild(build.id);
    const testOccurrencesResponse = await TeamcityFacade.getInstance().getAllTestOccurrences(build.id);
    if (hasTestOccurrences(testOccurrencesResponse)) {
        await storeTestsFromOccurrences(testOccurrencesResponse.testOccurrence, build);
    }

    function constructIndexedBuild(response: Build): IndexedBuild {
        const startMoment = moment(response.startDate, 'YYYYMMDDTHHmmssZ');
        const finishMoment = moment(response.finishDate, 'YYYYMMDDTHHmmssZ');

        const startDate = startMoment.isValid() ? startMoment.toDate() : "";
        const finishDate = finishMoment.isValid() ? finishMoment.toDate() : undefined;

        const duration: number =
            startDate && finishDate ? finishMoment.diff(startMoment) : undefined;
        const tenant: Prisma.tenantCreateManyInput =
            response.status !== 'canceled' ? getTenantFromBuildComment(response.comment) : null;
        return {
            build: {
                ...build,
                tenantId: tenant?.id ?? undefined,
            },
            details: {
                build_id: response.id,
                start_date: startDate,
                end_date: finishDate,
                duration: duration,
                passed: testOccurrencesResponse.passed,
                failed: testOccurrencesResponse.failed,
                ignored: testOccurrencesResponse.ignored,
            },
            tenant: tenant,
            test_occurrences: mapResponseToTestOccurrenceEntities(testOccurrencesResponse),
            double_failures: mapResponseToDoubleFailureEntities(testOccurrencesResponse),
        };
    }

    try {
        return constructIndexedBuild(buildResponse);
    } catch (err) {
        console.log("Error occurred while indexing build " + buildResponse.id);
        console.log("Build href: " + buildResponse.href);
        console.log("Test Occurrences href: " + testOccurrencesResponse.href)
        console.error(err);
        process.exit(1);
    }
}
