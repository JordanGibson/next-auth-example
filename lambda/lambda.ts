import type { suite } from "@prisma/client";
import { build_status, Prisma } from "@prisma/client";
import { env } from "process";
import {
  Build,
  BuildApiFactory,
  BuildTypeApi,
  BuildTypeApiFactory,
  BuildTypes,
  TestOccurrenceApiFactory,
} from "teamcity-client";
import { createLocator } from "./createLocator.js";
import * as async from "async";
import prisma from "../prisma";

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
  builds: Prisma.buildCreateManyInput[]
) {
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
  let [builds] = await Promise.all([
    buildApi
      .getAllBuilds(
        createLocator({
          buildType: {
            id: suite.id,
          },
          branch: {
            default: "false",
          },
          defaultFilter: "false",
          count: "5000",
        }),
        undefined
      )
      .then((builds) => {
        return builds.build!;
      })
      .then((builds): Prisma.buildCreateManyInput[] =>
        builds.map((build) => ({
          id: build.id!,
          suite_id: suite.id,
          tenant: "Not Implemented",
          state: build_status[build.state!],
        }))
      ),
  ]);

  await prisma.build.upsertMany(builds);
  return builds;
}

type IndexedSuite = {
  builds: Prisma.buildCreateManyInput[];
  resultSummary: Prisma.build_results_summaryCreateManyInput[];
};

async function indexSuite(suite: suite): Promise<IndexedSuite> {
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
  let indexedSuites: IndexedSuite[] = await async.mapLimit(
    suitesToIndex,
    5,
    indexSuite
  );
}

indexTeamCity().then(() => console.log("done"));
