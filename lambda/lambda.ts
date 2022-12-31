import {env} from "process";
import {
    Build,
    BuildApiFactory,
    BuildTypeApi,
    BuildTypeApiFactory,
    BuildTypes,
    TestOccurrenceApiFactory,
} from "teamcity-client";
import {createLocator} from "./createLocator.js";
import prisma from "./prisma";
import {build_status, Prisma, suite} from "@prisma/client";
import moment from "moment";

const buildTypeApi = BuildTypeApiFactory();
const buildApi = BuildApiFactory();
const testOccurrenceApi = TestOccurrenceApiFactory();

env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

async function getAllSuitesFromTeamCity(): Promise<suite[]> {
    const result: BuildTypes = await new BuildTypeApi().getAllBuildTypes();
    const buildTypes: Prisma.suiteCreateManyInput[] = result.buildType!.map(
        (buildType) => ({
            id: buildType.id!,
            description: buildType.description || "",
            name: buildType.name!,
        })
    )!;

    await prisma.suite.upsertMany(buildTypes);

    return prisma.suite.findMany();
}

function stripFailedFromClassName(name: string) {
    return name.replace(RegExp(".*?: (.*)"), "$1");
}

async function getAndStoreBuildResultsSummary(
    indexedBuilds: IndexedBuild[]
) {
    const builds = indexedBuilds.map((indexedBuild) => indexedBuild.build);
    const buildResultsSummary: Prisma.build_results_summaryCreateManyInput[] = (
        await Promise.all(
            builds.map(async (build) => {
                const testOccurrencesResponse =
                    await testOccurrenceApi.getAllTestOccurrences(
                        createLocator({
                            build: {
                                id: build.id!.toString(),
                            },
                            count: "1000",
                        })
                    );
                if (!(testOccurrencesResponse.count >= 1)) {
                    return null;
                }

                const testOccurrences = testOccurrencesResponse.testOccurrence;
                await prisma.test.createMany({
                    data: testOccurrences.map(
                        (testOccurrence): Prisma.testCreateManyInput => ({
                            class_name: stripFailedFromClassName(testOccurrence.name),
                            suite_id: build.suite_id,
                        })
                    ),
                    skipDuplicates: true,
                });

                await prisma.test_occurrence.createMany({
                    data: testOccurrences.map(
                        (testOccurrence): Prisma.test_occurrenceCreateManyInput => ({
                            id: testOccurrence.id,
                            build_id: build.id,
                            test_class_name: stripFailedFromClassName(testOccurrence.name),
                            status: testOccurrence.status.toString(),
                            duration: testOccurrence.duration ?? 0,
                            href: testOccurrence.href,
                            ignored: testOccurrence.ignored ?? false,
                        })
                    ),
                    skipDuplicates: true,
                });

                return {
                    build_id: build.id!,
                    passed: testOccurrencesResponse.passed ?? 0,
                    failed: testOccurrencesResponse.failed ?? 0,
                    ignored: testOccurrencesResponse.ignored ?? 0,
                };
            })
        )
    ).filter((build) => build !== null);

    await prisma.build_results_summary.upsertMany(buildResultsSummary);
    return buildResultsSummary;
}

async function getAndStoreBuilds(suite) {
    console.log(`Getting builds for suite ${suite.name}`);

    function mapToDbModel(build: Build): Prisma.buildCreateManyInput {
        return ({
            id: build.id!,
            suite_id: suite.id,
            tenant: "Not Implemented",
            state: build_status[build.state!],
        });
    }

    async function getBuilds() {
        const buildsResponse = await buildApi.getAllBuilds(createLocator({
            buildType: {
                id: suite.id
            },
            branch: {
                default: "false"
            },
            defaultFilter: "false",
            count: "5000"
        }));
        const builds = buildsResponse.build!.map(mapToDbModel);
        return await Promise.all(builds.map(indexBuild));
    }

    async function indexBuild(build: Prisma.buildCreateManyInput): Promise<IndexedBuild> {
        const response = await buildApi.getBuild(String(build.id));

        function createBuildDetails(response: Build): IndexedBuild {
            const startDate = moment(response.startDate, "YYYYMMDDTHHmmssZ");
            const finishDate = moment(response.finishDate, "YYYYMMDDTHHmmssZ");
            return {
                build: {
                    ...build,
                },
                details: {
                    build_id: build.id,
                    start_date: startDate.toDate(),
                    end_date: finishDate.toDate(),
                    duration: finishDate.diff(startDate),
                }
            }
        }

        return createBuildDetails(response);
    }

    let indexedBuilds = await getBuilds();

    await prisma.build.upsertMany(indexedBuilds.map((indexedBuild) => indexedBuild.build));
    await prisma.build_details.upsertMany(indexedBuilds.map((indexedBuild) => indexedBuild.details));
    return indexedBuilds;
}

type IndexedBuild = {
    build: Prisma.buildCreateManyInput;
    details: Prisma.build_detailsCreateManyInput;
}

type IndexedSuite = {
    builds: Prisma.buildCreateManyInput[];
    resultSummary: Prisma.build_results_summaryCreateManyInput[];
};

async function indexSuite(suite: suite): Promise<IndexedSuite> {
    let builds = await getAndStoreBuilds(suite);
    let resultSummary = await getAndStoreBuildResultsSummary(builds);
    return {
        builds: builds.map((indexedBuild) => indexedBuild.build),
        resultSummary,
    };
}

async function indexTeamCity() {
    const suites = await getAllSuitesFromTeamCity();
    const suitesToIndex: suite[] = suites.filter((suite) => suite.index);

    for (const suite of suitesToIndex) {
        await indexSuite(suite);
    }
}

await indexTeamCity().catch((e) => {
    console.error(e);
    process.exit(1);
});
