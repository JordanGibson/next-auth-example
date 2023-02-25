import { NextApiRequest, NextApiResponse } from 'next';
import { build_state, confidence_level } from '@prisma/client';
import prisma from "../../../../client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            await get(req, res);
            break;
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export type Build = {
    id: number;
    state: build_state;
    status: string | undefined;
    double_failures: string[];
    start_date?: Date;
    end_date?: Date;
    duration?: number;
    confidence_level?: string;
};

export type LatestBuildsForSuiteResponseType = {
    prod: Build;
    preview: Build;
};

async function get(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    async function getBuildForConfidenceLevel(level: confidence_level): Promise<Build> {
        const build = await prisma.build.findFirstOrThrow({
            where: {
                AND: {
                    suite_id: id as string,
                    tenant: {
                        confidence_level: {
                            equals: level,
                        },
                    },
                },
            },
            select: {
                id: true,
                state: true,
                status: true,
                tenant: {
                    select: {
                        confidence_level: true,
                    },
                },
                build_double_failure: {
                    select: {
                        test_class_name: true,
                    },
                },
                build_details: {
                    select: {
                        start_date: true,
                        end_date: true,
                        duration: true,
                    },
                },
            },
            orderBy: {
                build_details: {
                    start_date: 'desc',
                },
            },
        });
        return {
            id: build.id,
            state: build.state,
            status: build.status ?? undefined,
            double_failures: build.build_double_failure.flatMap(x => x.test_class_name),
            start_date: build.build_details?.start_date ?? undefined,
            end_date: build.build_details?.end_date ?? undefined,
            duration: build.build_details?.duration ?? undefined,
            confidence_level: build.tenant?.confidence_level
        };
    }

    const response: LatestBuildsForSuiteResponseType = {
        prod: await getBuildForConfidenceLevel(confidence_level.prod),
        preview: await getBuildForConfidenceLevel(confidence_level.preview),
    };

    res.json(response);
}
