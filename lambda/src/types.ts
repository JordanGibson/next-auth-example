import type {Prisma} from "@prisma/client";

export type IndexedBuild = {
    build: Prisma.buildCreateManyInput;
    details: Prisma.build_detailsCreateWithoutBuildInput;
    test_occurrences: Prisma.test_occurrenceCreateManyBuildInput[];
    double_failures: Prisma.build_double_failureCreateManyBuildInput[];
    tenant: Prisma.tenantCreateManyInput;
}
