import type {Build, Builds} from "teamcity-client";
import {build_state} from "@prisma/client";

export default function mapBuildsToEntity(build: Builds, suiteId: string) {
    return build.build!.map(build => mapBuildToEntity(build, suiteId));
}
export function mapBuildToEntity(build: Build, suiteId: string) {
    return {
        id: build.id!,
        suite_id: suiteId,
        state: build_state[build.state!],
        status: build.status,
    };
}