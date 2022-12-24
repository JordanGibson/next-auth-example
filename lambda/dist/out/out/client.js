import { PrismaClient } from "@prisma/client";
const basePrisma = new PrismaClient();
const prisma = new PrismaClient().$extends({
    model: {
        comment: {
            upsertMany: async (data) => {
                const existing = await basePrisma.comment.findMany({ where: { id: { in: data.map((d) => d.id) } } });
                const existingIds = existing.map((e) => e.id);
                const toCreate = data.filter((d) => !existingIds.includes(d.id));
                const toUpdate = data.filter((d) => existingIds.includes(d.id));
                await basePrisma.comment.createMany({ data: toCreate });
                await basePrisma.comment.updateMany({ where: { id: { in: toUpdate.map((u) => u.id) } }, data: toUpdate });
            }
        }
    }
});
export default prisma;
