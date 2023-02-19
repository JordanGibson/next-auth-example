import {build_state} from "@prisma/client";
import classNames from "classnames";
import React from "react";

export function DoubleFailureStat({build, title}: { build: any; title: string }) {
    const value =
        build?.state === build_state.finished ? build?.double_failures.length : build?.status;
    return (
        <div className="stat">
            <div className="stat-title">{title}</div>
            <div className={classNames('stat-value', value === 0 ? 'text-success' : 'text-error')}>
                {value}
            </div>
            <div className="stat-desc">Double Failures</div>
        </div>
    );
}