import type {Comment} from "teamcity-client";
import {confidence_level, Prisma} from "@prisma/client";

const commentRegex = /^(\w+)?\s*([\d\.]+)?\s*(?:Name:\s+(\S+))?\s*(?:URL:\s+(\S+))?\s*(?:Instance:\s+([a-zA-Z\.:/\-0-9]+))?\s*(?:Password:\s+(\S+))?\s*(?:Test Type:\s(\S+))?\s*/;

export function getTenantFromBuildComment(comment: Comment): Prisma.tenantCreateManyInput | undefined {
    let match = comment?.text.match(commentRegex);
    if (match) {
        let [, confidenceLevel, version, name, , instance, password, testType] = match;
        confidenceLevel = confidenceLevel?.replace("rc", "").toLowerCase() || "unknown";
        if (instance) {
            return {
                id: instance,
                confidence_level: confidence_level[confidenceLevel],
                testType: testType ?? undefined,
                version: version ?? undefined,
                name: name ?? undefined,
                password: password ?? undefined,
            }
        }
    }
    return undefined;
}