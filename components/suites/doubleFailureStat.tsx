import {build_state} from '@prisma/client';
import classNames from 'classnames';
import React from 'react';
import {Build} from '../../pages/api/suite/latest/[id]';
import {Queue} from '@mui/icons-material';
import {SuccessfullyCompletedTimeAgo} from "./successfullyCompletedTimeAgo";
import {BuildDuration} from "./buildDuration";
import {QueuedStartedTimeAgo} from "./queuedStartedTimeAgo";
import {toTitleCase} from "../../lambda/src/utils";

function FinishedBuildDetails(props: { build: Build }) {
    return (
        <div className={'stat-desc flex flex-col'}>
            <SuccessfullyCompletedTimeAgo build={props.build}/>
            <BuildDuration build={props.build}/>
        </div>
    );
}

function RunningBuildDetails(props: { build: Build }) {
    return (
        <div className={'stat-desc flex flex-col'}>
            <QueuedStartedTimeAgo build={props.build} />
        </div>
    );
}

function QueuedBuildDetails() {
    return (
        <div className={'stat-desc flex flex-col'}>
            <div className={'my-auto flex flex-row'}>
                <Queue />
                <div className={'my-auto text-left ml-1'}>Queued</div>
            </div>
        </div>
    );
}

export function DoubleFailureStat({ build, title }: { build: Build; title: string }) {
    const isFinished = build?.state === build_state.finished;
    const isQueued = build?.state === build_state.queued;
    const value = isFinished ? build?.double_failures.length : toTitleCase(build?.state);
    let textColourClass = getTextColourClass(value, isFinished, isQueued, build);
    return (
        <div className="stat">
            <div className="stat-title">{title}</div>
            <div className={classNames('stat-value', textColourClass)}>{value}</div>
            {isFinished ? <div className="stat-desc">Double Failures</div> : <></>}
            {isQueued ? (
                <QueuedBuildDetails />
            ) : isFinished ? (
                <FinishedBuildDetails build={build} />
            ) : (
                <RunningBuildDetails build={build} />
            )}
        </div>
    );
}


function getTextColourClass(
    value: number | string,
    isFinished: boolean,
    isQueued: boolean,
    build: Build
) {
    if (value === 0) {
        return 'text-success';
    } else if (isQueued || build?.state === build_state.running) {
        return 'text-info';
    } else {
        return 'text-error';
    }
}


