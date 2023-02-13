import useSWR from "swr";
import {build, suite} from "@prisma/client";
import type {build_details} from "@prisma/client";
import {getFetcher} from "./_swrFetcher";
import {ChartData, ChartDataset} from "chart.js";
import moment from "moment";
import {getBgColorFromCssClass} from "../utils/getColorFromCssClass";
import React from "react";
import {registerChart} from "./common/utils";
import ThemedLineChart from "../components/common/themedLineChart";

function SuiteCard({suite}: { suite: suite }) {

    const {
        data,
        error,
        isLoading,
    } = useSWR("/api/build/" + suite.id, getFetcher<(build & { build_details: build_details })[]>());

    const labelToCssClass = (label?: string): string => {
        switch (label?.toLowerCase()) {
            case "passed":
                return "bg-success";
            case "failed":
                return "bg-error";
            case "ignored":
                return "bg-neutral-content";
        }
        return "bg-neutral-content";
    }

    const displayData = data?.filter(x => x.build_details != null && x.build_details.end_date != null);

    const labels = displayData?.map((build) => build.build_details.end_date).map(x => moment(x).format("ddd DD")) ?? [];

    function getDataset(label: string, cssClass: string, value: keyof build_details): ChartDataset<'line'> {
        return {
            label: label,
            data: displayData?.map((x) => x.build_details[value]) ?? new Array(),
            borderColor: getBgColorFromCssClass(cssClass),
            backgroundColor: getBgColorFromCssClass(cssClass),
        };
    }

    function getChartData(): ChartData<'line'> {
        return {
            labels,
            datasets: [
                getDataset('Passed', "bg-success", "passed"),
                getDataset('Failed', "bg-error", "failed"),
                getDataset("Ignored", "bg-neutral-content", "ignored"),
            ],
        };
    }

    if (error) return <div>failed to load</div>;
    if (isLoading) return <progress className="progress w-56"></progress>;
    return (
        <div
            className={"card max-w-full min-w-fit bg-base-200 mx-5 my-3 rounded p-5 flex justify-between flex flex-row"}>
            <div>{suite.name}</div>
            <ThemedLineChart className={"w-1/2"} getChartData={getChartData} labelToCssClass={labelToCssClass}/>
        </div>
    );
}

export default function Dashboard() {
    registerChart();
    const {data, error, isLoading} = useSWR(
        "/api/suite",
        getFetcher<suite[]>()
    );

    if (error) return <div>failed to load</div>;
    if (isLoading) return <div>loading...</div>;
    return (
        <div className={"max-w-full min-w-fit"}>
            {data!.filter(x => x.index).map((suite) => (
                <SuiteCard suite={suite}/>
            ))}
        </div>
    );
}
