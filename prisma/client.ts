import { Prisma, PrismaClient } from "@prisma/client";

const basePrisma = new PrismaClient();
const prisma = new PrismaClient().$extends({
  model: {
    comment: {
      upsertMany: async (data: Prisma.commentCreateManyInput[]) => {
        return data.map(async (comment) => {
          return await basePrisma.comment.upsert({
            where: { id: comment.id },
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
            where: { id: suite.id },
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
            where: { id: build.id },
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
            where: { build_id: build_results_summary.build_id },
            update: build_results_summary,
            create: build_results_summary,
          });
        });
      },
    },
  },
});
console.log("Created prisma client");

export default prisma;
