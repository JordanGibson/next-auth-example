import useSWR from 'swr';
import { getFetcher } from './_swrFetcher';
import React from 'react';
import { suite_favourite } from './api/suite';
import { Star, StarBorderOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import {build_state, confidence_level} from '@prisma/client';
import {SuiteSummary} from "./api/suite/summary/[id]";
import classNames from "classnames";
import moment from "moment";

const FavouriteButton = ({ isFavourite }: { isFavourite: boolean }) => {
    return isFavourite ? (
        <motion.div transition={{ duration: 0.1 }}>
            <Star className={'fill-accent'} />
        </motion.div>
    ) : (
        <motion.div animate={{ rotate: 72 }} transition={{ duration: 0.1 }}>
            <StarBorderOutlined className={'fill-accent'} />
        </motion.div>
    );
};

function DoubleFailureStat({build, title}: { build: any, title: string }) {
    const value = build?.state === build_state.finished ? build?.double_failures.length : build?.status;
    return <div className="stat">
        <div className="stat-title">{title}</div>
        <div
            className={classNames("stat-value", value === 0 ? "text-success" : "text-error")}>{value}</div>
        <div className="stat-desc">Double Failures</div>
    </div>;
}

function SuiteCard({ suite, onClick }: { suite: suite_favourite; onClick: () => Promise<void> }) {
    const { data, error, isLoading } = useSWR(
        '/api/suite/summary/' + suite.id,
        getFetcher<SuiteSummary>()
    );
    const prodBuild = data?.find(x => x.confidence_level === confidence_level.prod);
    const previewBuild = data?.find(x => x.confidence_level === confidence_level.preview);
    return (
        <div className={'p-5 bg-base-200 m-3'}>
            <div className={'flex flex-row'}>
                <div>{suite.name}</div>
                <div className={'mx-2'} onClick={onClick}>
                    <FavouriteButton isFavourite={suite.isFavourite}/>
                </div>
            </div>
            <div className={"my-2"}>
                <div className="stats shadow mx-5">
                    <DoubleFailureStat build={prodBuild} title={"Prod"}/>
                </div>
                <div className="stats shadow mx-5">
                    <DoubleFailureStat build={previewBuild} title={"Preview"}/>
                </div>
            </div>
        </div>
    );
}

export default function Suites() {
    async function putFavouriteSuite(suites: suite_favourite[], suite: suite_favourite) {
        await fetch(`/api/suite/favourite`, {
            method: 'PUT',
            body: JSON.stringify({
                suite: suite.id,
                isFavourite: !suite.isFavourite,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return toggleFavourite(suites, suite);
    }

    const {
        data: suites,
        error,
        isLoading,
        mutate,
    } = useSWR<suite_favourite[]>('/api/suite/indexed', getFetcher<suite_favourite[]>());
    if (error) {
        console.log('Error');
        return <div>failed to load</div>;
    }
    if (isLoading) {
        console.log('Loading');
        return <div>loading...</div>;
    }

    async function onClickHandler(suite: suite_favourite) {
        await mutate(async () => putFavouriteSuite(suites!, suite), {
            optimisticData: () => toggleFavourite(suites!, suite),
        });
    }

    function toggleFavourite(suites: suite_favourite[], suite: suite_favourite): suite_favourite[] {
        return suites!.map(x =>
            x.id === suite.id ? { ...suite, isFavourite: !suite.isFavourite } : x
        );
    }

    return (
        <div className={'max-w-full min-w-fit'}>
            <div className={'px-5 py-2'}>
                {suites?.map((suite: suite_favourite) => (
                    <SuiteCard suite={suite} onClick={() => onClickHandler(suite)} />
                ))}
            </div>
        </div>
    );
}
