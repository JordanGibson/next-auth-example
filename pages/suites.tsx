import useSWR from "swr";
import {build, build_details, build_results_summary, suite} from "@prisma/client";
import {getFetcher} from "./_swrFetcher";
import {
    CategoryScale,
    Chart, ChartData,
    ChartDataset,
    ChartOptions,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from "chart.js";
import {Line} from "react-chartjs-2";
import moment from "moment";
import {getBgColorFromCssClass, getColorFromCssClass} from "../utils/getColorFromCssClass";
import {useEffect, useRef} from "react";
import useSWRImmutable from "swr/immutable";

function SuiteCard({suite}: { suite: suite }) {

    const {
        data,
        error,
        isLoading,
    } = useSWR("/api/build/" + suite.id, getFetcher<(build & { summary: build_results_summary, build_details: build_details })[]>());

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

    const chartRef = useRef<Chart>();
    useEffect(() => {
        const observer = new MutationObserver(() => {
            if (chartRef.current?.options)
                chartRef.current.options = getChartOptions();
            if (chartRef.current?.data) {
                let data: ChartData = chartRef.current.data;
                chartRef.current.data.datasets = data.datasets.map(dataset => {
                    return {
                        ...dataset,
                        borderColor: getBgColorFromCssClass(labelToCssClass(dataset.label)),
                        backgroundColor: getBgColorFromCssClass(labelToCssClass(dataset.label)),
                    }
                })
            }
            chartRef.current?.update('none');
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        return () => observer.disconnect();
    }, [chartRef]);

    const labels = data?.map((build) => build.build_details.end_date).map(x => moment(x).format("DD/MM")) ?? [];

    function getChartOptions(): ChartOptions<"line"> {
        return {
            responsive: true,
            aspectRatio: 4,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top' as const,
                    labels: {
                        color: getColorFromCssClass("primary-text"),
                    },
                },
                title: {
                    display: false,
                    text: 'Chart.js Line Chart',
                    color: getColorFromCssClass("primary-text"),
                    font: {
                        weight: "normal",
                    }
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: getColorFromCssClass("primary-text"),
                    }
                },
                y: {
                    ticks: {
                        color: getColorFromCssClass("primary-text"),
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.01,
                },
                point: {
                    pointStyle: "circle"
                }
            }
        };
    }

    const options = getChartOptions();

    function getDataset(label: string, cssClass: string, value: keyof build_results_summary): ChartDataset<'line'> {
        return {
            label: label,
            data: data?.map((x) => x.summary ? x.summary[value] : null) ?? new Array(),
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

    const chartData = getChartData();

    if (error) return <div>failed to load</div>;
    if (isLoading) return <progress className="progress w-56"></progress>;
    return (
        <div className={"card max-w-screen bg-base-200 mx-5 my-3 rounded p-5"}>
            <div>{suite.name}</div>
            <span className={"relative"}>
                <Line ref={chartRef} data={chartData} options={options}/>
            </span>
        </div>
    );
}

export default function Suites() {
    Chart.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend
    )
    const {data, error, isLoading} = useSWRImmutable(
        "/api/suite",
        getFetcher<suite[]>()
    );

    if (error) return <div>failed to load</div>;
    if (isLoading) return <div>loading...</div>;
    return (
        <div className={"max-w-full"}>
            {data!.filter(x => x.index).map((suite) => (
                <SuiteCard suite={suite}/>
            ))}
        </div>
    );
}
