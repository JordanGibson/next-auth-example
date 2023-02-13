import {Chart, ChartData, ChartOptions, ChartType} from "chart.js";
import {getBgColorFromCssClass, getColorFromCssClass} from "../../utils/getColorFromCssClass";
import {Line} from "react-chartjs-2";
import {MutableRefObject, Ref, useEffect, useRef} from "react";
import _default from "chart.js/dist/plugins/plugin.legend";
import labels = _default.defaults.labels;

const defaultChartOptions = (): ChartOptions<'line'> => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'right' as const,
            labels: {
                color: getColorFromCssClass("primary-text"),
            },
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
            tension: 0.03,
        },
        point: {
            pointStyle: "circle"
        }
    }
});

export default function ThemedLineChart({
                                            getChartData,
                                            getChartOptions,
                                            labelToCssClass,
    className
                                        }: { getChartData: () => ChartData<'line'>, getChartOptions?: () => ChartOptions<'line'>, labelToCssClass: (cssClass?: string) => string, className: string }): JSX.Element {
    if (!getChartOptions) {
        getChartOptions = defaultChartOptions;
    }
    const options = getChartOptions();
    const data = getChartData();
    const updatedOptions = {...defaultChartOptions, ...options};
    const chartRef = useRef<Chart>();
    useEffect(() => {
        const observer = new MutationObserver(() => {
                    if (chartRef.current?.options) {
                        if (getChartOptions) {
                            chartRef.current.options = getChartOptions();
                        }
                    }
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
                }
            );

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        return () => observer.disconnect();
    }, [chartRef]);

    useEffect(() => {
        chartRef.current?.resize();
    }, []);

    return (
        <span className={`relative ${className}`}>
                <Line ref={chartRef} data={data} options={updatedOptions}/>
            </span>
    )
        ;
}