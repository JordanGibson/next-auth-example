import {env} from 'process';
import {BuildTypeApiFactory, BuildTypes, TestOccurrence, TestOccurrenceApiFactory,} from 'teamcity-client';
import prisma from './src/prisma';
import type {suite} from '@prisma/client';
import type {Prisma} from "@prisma/client";
import {getBuilds, storeBuild} from './src/build';

const buildTypeApi = BuildTypeApiFactory();

env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

async function getAllSuitesFromTeamCity(): Promise<suite[]> {
    const result: BuildTypes = await buildTypeApi.getAllBuildTypes();
    const buildTypes: Prisma.suiteCreateManyInput[] = result.buildType!.map(buildType => ({
        id: buildType.id!,
        description: buildType.description || '',
        name: buildType.name!,
    }))!;

    await prisma.suite.upsertMany(buildTypes);

    return prisma.suite.findMany();
}

async function storeTenants(tenantCreateManyInputs: Prisma.tenantCreateManyInput[]) {
    await prisma.tenant.upsertMany(tenantCreateManyInputs);
}

async function getAndStoreBuilds(suite) {
    console.log(`Getting builds for suite ${suite.name}`);

    let indexedBuilds = await getBuilds(suite.id);

    await storeTenants(indexedBuilds.map(x => x.tenant).filter(x => x !== undefined));

    for (const x of indexedBuilds) {
        await storeBuild(x);
    }

    return indexedBuilds;
}

async function indexSuite(suite: suite): Promise<Prisma.buildCreateManyInput[]> {
    let builds = await getAndStoreBuilds(suite);
    return builds.map(indexedBuild => indexedBuild.build);
}

async function indexTeamCity() {
    const suites = await getAllSuitesFromTeamCity();
    const suitesToIndex: suite[] = suites.filter(suite => suite.index);

    for (const suite of suitesToIndex) {
        await indexSuite(suite);
    }
}

await indexTeamCity().catch(e => {
    console.error(e);
    process.exit(1);
});
