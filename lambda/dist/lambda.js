import "@prisma/client";
import { env } from "process";
import { BuildApiFactory, BuildTypeApiFactory, TestOccurrenceApiFactory, } from "teamcity-client";
import prisma from "./client.js";
const buildTypeApi = BuildTypeApiFactory();
const buildApi = BuildApiFactory();
const testOccurrenceApi = TestOccurrenceApiFactory();
env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
// async function getAllSuitesFromTeamCity(): Promise<suite[]> {
//   const result: BuildTypes = await new BuildTypeApi().getAllBuildTypes();
//   const buildTypes: Prisma.suiteCreateManyInput[] = result.buildType!.map(
//     (buildType) => ({
//       id: buildType.id!,
//       description: buildType.description || "",
//       name: buildType.name!,
//     })
//   )!;
//
//   await prisma.suite.createMany({
//     data: buildTypes,
//     skipDuplicates: true,
//   });
//
//   return prisma.suite.findMany();
// }
//
// const suites = await getAllSuitesFromTeamCity();
// const suitesToIndex = suites.filter((suite) => suite.index);
//
// async function indexSuite(suite: suite) {
//   let [builds] = await Promise.all([
//     buildApi
//       .getAllBuilds(
//         createLocator({
//           buildType: {
//             id: suite.id,
//           },
//           branch: {
//             default: "false",
//           },
//           defaultFilter: "false",
//           count: "1000",
//         }),
//         undefined
//       )
//       .then((builds) => {
//         return builds.build!;
//       })
//       .then((builds): Prisma.buildCreateManyInput[] =>
//         builds.map((build) => ({
//           id: build.id!,
//           suite_id: suite.id,
//           tenant: "Not Implemented",
//           state: build_status[build.state!],
//         }))
//       ),
//   ]);
//
//   await prisma.build.createMany({
//     data: builds,
//     skipDuplicates: true,
//   });
//
//   const buildResultsSummary: Prisma.build_results_summaryCreateManyInput[] = (
//     await Promise.all(
//       builds.map(async (build) => {
//         const testOccurrences = await testOccurrenceApi.getAllTestOccurrences(
//           createLocator({
//             build: {
//               id: build.id!.toString(),
//             },
//             count: "1000",
//           })
//         );
//         if (testOccurrences.count === 0) {
//           return null;
//         }
//
//         return {
//           build_id: build.id!,
//           passed: testOccurrences.passed ?? 0,
//           failed: testOccurrences.failed ?? 0,
//           ignored: testOccurrences.ignored ?? 0,
//         };
//       })
//     )
//   ).filter((build) => build !== null);
//
//   await prisma.build_results_summary.createMany({
//     data: buildResultsSummary,
//   });
// }
//
// for (let i = 0; i < suitesToIndex.length; i++) {
//   let suite = suitesToIndex[i];
//   await indexSuite(suite);
// }
// ON CONFLICT (id) DO UPDATE SET <all fields> - id
await prisma.comment.upsertMany([
    {
        id: '1',
        user_id: '1',
        entity_id: '1',
        entity_type: "build",
        content: "Hello"
    },
    {
        id: '2',
        user_id: '1',
        entity_id: '1',
        entity_type: "has changed",
        content: "Hello",
    },
]);
