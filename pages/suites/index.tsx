import useSWR from 'swr';
import { getFetcher } from '../_swrFetcher';
import React from 'react';
import { LatestBuildsForSuiteResponseType } from '../api/suite/latest/[id]';
import { Spinner } from '../../components/common/spinner';
import { Endpoints } from '../api/_endpoints';
import { IndexedSuite, IndexedSuitesResponseType } from '../api/suite/indexed';
import { DoubleFailureStat } from '../../components/suites/doubleFailureStat';
import { FavouriteButton } from '../../components/suites/favouriteButton';
import { putFavouriteSuite, toggleFavourite } from '../utils/putFavouriteSuite';
import { registerChart } from '../common/utils';
import ThemedLineChart from '../../components/common/themedLineChart';
import { build, build_details } from '@prisma/client';
import { ChartData, ChartDataset } from 'chart.js';
import { getBgColorFromCssClass } from '../../utils/getColorFromCssClass';
import moment from 'moment/moment';
import { useRouter } from 'next/router';
import Link from 'next/link';

function SuiteCard({ suite, onClick }: { suite: IndexedSuite; onClick: () => Promise<void> }) {
    registerChart();

    const router = useRouter();

    const { data: latestBuilds, isLoading: latestBuildsLoading } = useSWR(
        Endpoints.latestBuildsForSuite(suite.id),
        getFetcher<LatestBuildsForSuiteResponseType>()
    );

    const { data: buildData, isLoading: buildsForSuiteLoading } = useSWR(
        '/api/builds/' + suite.id,
        getFetcher<(build & { build_details: build_details })[]>()
    );

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

    if (buildsForSuiteLoading || latestBuildsLoading || !latestBuilds) return <Spinner />;

    return (
        <Link href={{ pathname: `/suites/${suite.id}` }}>
            <div className={'p-5 bg-base-200 m-3 max-w-full  hover:cursor-pointer'}>
                <div id={'suite-title'} className={'flex flex-row'}>
                    <div>{suite.name}</div>
                    <div id={suite.id + '-favouriteButton'} className={'mx-2'} onClick={onClick}>
                        <FavouriteButton isFavourite={suite.isFavourite} />
                    </div>
                </div>
                <div className={'my-2 min-w-full grid grid-cols-5'}>
                    <div id={'prod-double-failure-stat'} className="stats shadow mx-5">
                        <DoubleFailureStat build={latestBuilds.prod} title={'Prod'} />
                    </div>
                    <div id={'preview-double-failure-stat'} className="stats shadow mx-5">
                        <DoubleFailureStat build={latestBuilds.preview} title={'Preview'} />
                    </div>
                    <div className={'col-span-3'}>
                        <ThemedLineChart
                            className={'w-full'}
                            getChartData={getChartData}
                            labelToCssClass={labelToCssClass}
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function Suites() {
    const {
        data: suites,
        error,
        isLoading,
        mutate,
    } = useSWR<IndexedSuitesResponseType>(
        Endpoints.indexedSuites,
        getFetcher<IndexedSuitesResponseType>()
    );
    if (error) return <div>failed to load</div>;
    if (isLoading) return <Spinner />;

    async function onClickHandler(suite: IndexedSuite) {
        await mutate(async () => putFavouriteSuite(suites!, suite), {
            optimisticData: () => toggleFavourite(suites!, suite),
        });
    }

    return (
        <div className={'max-w-full min-w-fit'}>
            <div className={'px-5 py-2'}>
                {suites?.map((suite: IndexedSuite) => (
                    <SuiteCard key={suite.id} suite={suite} onClick={() => onClickHandler(suite)} />
                ))}
            </div>
        </div>
    );
}
