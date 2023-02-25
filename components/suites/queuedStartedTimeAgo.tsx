import {build_state} from "@prisma/client";
import {Queue, StartRounded} from "@mui/icons-material";
import React from "react";
import {formatDate} from "../../utils/timeUtils";
import {Build} from "../../pages/api/suite/latest/[id]";

export function QueuedStartedTimeAgo(props: { build: Build }) {
    return <div className={"my-auto flex flex-row"}>
        {props.build?.state === build_state.queued ? <Queue/> : <StartRounded/>}
        <div className={"my-auto text-left ml-1"}>
            Started {formatDate(props.build?.start_date)}
        </div>
    </div>;
}