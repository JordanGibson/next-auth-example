import useSWR from 'swr';
import { getFetcher } from './_swrFetcher';
import React from 'react';
import { LatestBuildsForSuiteResponseType } from './api/suite/latest/[id]';
import { Spinner } from '../components/common/spinner';
import { Endpoints } from './api/_endpoints';
import { IndexedSuite, IndexedSuitesResponseType } from './api/suite/indexed';
import { DoubleFailureStat } from '../components/suites/doubleFailureStat';
import { FavouriteButton } from '../components/suites/favouriteButton';
import { putFavouriteSuite, toggleFavourite } from './utils/putFavouriteSuite';
import {toast} from "react-toastify";

function SuiteCard({ suite, onClick }: { suite: IndexedSuite; onClick: () => Promise<void> }) {
    const { data } = useSWR(
        Endpoints.latestBuildsForSuite(suite.id),
        getFetcher<LatestBuildsForSuiteResponseType>()
    );
    return (
        <div className={'p-5 bg-base-200 m-3'}>
            <div id={'suite-title'} className={'flex flex-row'}>
                <div>{suite.name}</div>
                <div id={suite.id + '-favouriteButton'} className={'mx-2'} onClick={onClick}>
                    <FavouriteButton isFavourite={suite.isFavourite} />
                </div>
            </div>
            <div className={'my-2'}>
                <div id={'prod-double-failure-stat'} className="stats shadow mx-5">
                    <DoubleFailureStat build={data?.prod} title={'Prod'} />
                </div>
                <div id={'preview-double-failure-stat'} className="stats shadow mx-5">
                    <DoubleFailureStat build={data?.preview} title={'Preview'} />
                </div>
            </div>
        </div>
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
