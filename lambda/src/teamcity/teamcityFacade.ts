import {Build, BuildApiFactory, Builds, TestOccurrenceApiFactory, TestOccurrences} from "teamcity-client";
import build from "next/dist/build";
import {buildsForSuite, buildWithIdAndCount} from "./locators";

export default class TeamcityFacade {
    private static instance: TeamcityFacade;
    private buildApi = BuildApiFactory();
    private testOccurrenceApi = TestOccurrenceApiFactory();
    private constructor() {}

    public static getInstance(): TeamcityFacade {
        if(!TeamcityFacade.instance) {
            TeamcityFacade.instance = new TeamcityFacade();
        }
        return TeamcityFacade.instance;
    }

    public async getAllBuildsForSuite(suiteId: string): Promise<Builds> {
        return await this.buildApi.getAllBuilds(buildsForSuite(suiteId));
    }

    public async getBuild(buildId: number): Promise<Build> {
        return await this.buildApi.getBuild(String(buildId));
    }

    public async getAllTestOccurrences(buildId: number): Promise<TestOccurrences> {
        return await this.testOccurrenceApi.getAllTestOccurrences(buildWithIdAndCount(buildId));
    }
}