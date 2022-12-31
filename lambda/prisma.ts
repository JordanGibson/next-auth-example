import {Prisma, PrismaClient, PrismaPromise} from "@prisma/client";

const basePrisma = new PrismaClient();

export const prismaExtensionConfig = {
    model: {
        comment: {
            async upsertMany(data: Prisma.commentCreateManyInput[]) {
                return data.map(async (comment) => {
                    return await basePrisma.comment.upsert({
                        where: {id: comment.id},
                        update: comment,
                        create: comment,
                    });
                });
            },
        },
        suite: {
            upsertMany: async (data: Prisma.suiteCreateManyInput[]) => {
                return data.map(async (suite) => {
                    return await basePrisma.suite.upsert({
                        where: {id: suite.id},
                        update: suite,
                        create: suite,
                    });
                });
            },
        },
        build: {
            upsertMany: async (data: Prisma.buildCreateManyInput[]) => {
                return data.map(async (build) => {
                    return await basePrisma.build.upsert({
                        where: {id: build.id},
                        update: build,
                        create: build,
                    });
                });
            },
        },
        build_results_summary: {
            upsertMany: async (
                data: Prisma.build_results_summaryCreateManyInput[]
            ) => {
                return data.map(async (build_results_summary) => {
                    return await basePrisma.build_results_summary.upsert({
                        where: {build_id: build_results_summary.build_id},
                        update: build_results_summary,
                        create: build_results_summary,
                    });
                });
            },
        },
        build_details: {
            upsertMany: async (data: Prisma.build_detailsCreateManyInput[]) => {
                return data.map(async (build_details) => {
                    return await basePrisma.build_details.upsert({
                        where: {build_id: build_details.build_id},
                        update: build_details,
                        create: build_details,
                    });
                });
            }
        }
    },
};
const extendedClient = basePrisma.$extends(prismaExtensionConfig);

export default extendedClient;
