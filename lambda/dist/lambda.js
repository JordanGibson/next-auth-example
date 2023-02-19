import { env } from "process";
import { BuildApiFactory, BuildTypeApi, BuildTypeApiFactory, TestOccurrenceApiFactory, } from "teamcity-client";
import { createLocator } from "./createLocator.js";
import * as async from "async";
import prisma from "prisma";
import { build_status } from "@prisma/client";
import moment from "moment";
const buildTypeApi = BuildTypeApiFactory();
const buildApi = BuildApiFactory();
const testOccurrenceApi = TestOccurrenceApiFactory();
env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
async function getAllSuitesFromTeamCity() {
    const result = await new BuildTypeApi().getAllBuildTypes();
    const buildTypes = result.buildType.map((buildType) => ({
        id: buildType.id,
        description: buildType.description || "",
        name: buildType.name,
    }));
    await prisma.suite.upsertMany(buildTypes);
    return prisma.suite.findMany();
}
function stripFailedFromClassName(name) {
    return name.replace(RegExp(".*?: (.*)"), "$1");
}
async function getAndStoreBuildResultsSummary(builds) {
    const buildResultsSummary = (await Promise.all(builds.map(async (build) => {
        var _a, _b, _c;
        const testOccurrencesResponse = await testOccurrenceApi.getAllTestOccurrences(createLocator({
            build: {
                id: build.id.toString(),
            },
            count: "1000",
        }));
        if (!(testOccurrencesResponse.count >= 1)) {
            return null;
        }
        const testOccurrences = testOccurrencesResponse.testOccurrence;
        await prisma.test.createMany({
            data: testOccurrences.map((testOccurrence) => ({
                class_name: stripFailedFromClassName(testOccurrence.name),
                suite_id: build.suite_id,
            })),
            skipDuplicates: true,
        });
        await prisma.test_occurrence.createMany({
            data: testOccurrences.map((testOccurrence) => {
                var _a, _b;
                return ({
                    id: testOccurrence.id,
                    build_id: build.id,
                    test_class_name: stripFailedFromClassName(testOccurrence.name),
                    status: testOccurrence.status.toString(),
                    duration: (_a = testOccurrence.duration) !== null && _a !== void 0 ? _a : 0,
                    href: testOccurrence.href,
                    ignored: (_b = testOccurrence.ignored) !== null && _b !== void 0 ? _b : false,
                });
            }),
            skipDuplicates: true,
        });
        return {
            build_id: build.id,
            passed: (_a = testOccurrencesResponse.passed) !== null && _a !== void 0 ? _a : 0,
            failed: (_b = testOccurrencesResponse.failed) !== null && _b !== void 0 ? _b : 0,
            ignored: (_c = testOccurrencesResponse.ignored) !== null && _c !== void 0 ? _c : 0,
        };
    }))).filter((build) => build !== null);
    await prisma.build_results_summary.upsertMany(buildResultsSummary);
    return buildResultsSummary;
}
async function getAndStoreBuilds(suite) {
    function calculateDuration(build) {
        const startDate = moment(build.startDate, "YYYYMMDDTHHmmssZ");
        const finishDate = moment(build.finishDate, "YYYYMMDDTHHmmssZ");
        return finishDate.diff(startDate);
    }
    console.log(`Getting builds for suite ${suite.name}`);
    let [builds] = await Promise.all([
        buildApi
            .getAllBuilds(createLocator({
            buildType: {
                id: suite.id,
            },
            branch: {
                default: "false",
            },
            defaultFilter: "false",
            count: "5000",
        }), undefined)
            .then((builds) => {
            return builds.build;
        })
            .then((builds) => builds.map((build) => ({
            id: build.id,
            suite_id: suite.id,
            tenant: "Not Implemented",
            state: build_status[build.state],
            duration: calculateDuration(build)
        }))),
    ]);
    await prisma.build.upsertMany(builds);
    return builds;
}
async function indexSuite(suite) {
    let builds = await getAndStoreBuilds(suite);
    let resultSummary = await getAndStoreBuildResultsSummary(builds);
    return {
        builds,
        resultSummary,
    };
}
async function indexTeamCity() {
    const suites = await getAllSuitesFromTeamCity();
    const suitesToIndex = suites.filter((suite) => suite.index);
    let indexedSuites = await async.mapLimit(suitesToIndex, 5, indexSuite);
    console.log(indexedSuites);
}
await indexTeamCity();
