import ThemedLineChart from "../common/themedLineChart";
import React from "react";
import {build_details} from "@prisma/client";
import {ChartData, ChartDataset} from "chart.js";
import {getBgColorFromCssClass} from "../../utils/getColorFromCssClass";
import moment from "moment";
import {GetSuiteResponseType} from "../../pages/api/suite/[id]";
import {GetBuildsBySuiteIdResponseType} from "../../pages/api/builds/[suiteId]";

export default function BuildTestHistoryChart({className, buildData}: {className?: string, buildData: GetBuildsBySuiteIdResponseType}) {
    const labelToCssClass = (label?: string): string => {
        switch (label?.toLowerCase()) {
            case 'passed':
                return 'bg-success';
            case 'failed':
                return 'bg-error';
            case 'ignored':
                return 'bg-neutral-content';
        }
        return 'bg-neutral-content';
    };

    const displayData = buildData?.filter(
        x => x.build_details != null && x.build_details.end_date != null
    );


    function getDataset(
        label: string,
        cssClass: string,
        value: keyof Pick<build_details, 'passed' | 'failed' | 'ignored'>
    ): ChartDataset<'line'> {
        return {
            label: label,
            data: displayData?.map(x => x.build_details[value]) ?? new Array(),
            borderColor: getBgColorFromCssClass(cssClass),
            backgroundColor: getBgColorFromCssClass(cssClass),
        };
    }

    const labels =
        displayData
            ?.map(build => build.build_details.end_date)
            .map(x => moment(x).format('ddd DD')) ?? [];

    function getChartData(): ChartData<'line'> {
        return {
            labels,
            datasets: [
                getDataset('Passed', 'bg-success', 'passed'),
                getDataset('Failed', 'bg-error', 'failed'),
                getDataset('Ignored', 'bg-neutral-content', 'ignored'),
            ],
        };
    }
    return (<ThemedLineChart
        className={className}
        getChartData={getChartData}
        labelToCssClass={labelToCssClass}
    />);
}


