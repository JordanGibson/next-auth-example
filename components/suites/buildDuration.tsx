import {Build} from "../../pages/api/suite/latest/[id]";
import {Timer} from "@mui/icons-material";
import React from "react";
import {formatDuration} from "../../utils/timeUtils";

export function BuildDuration(props: { build: Build }) {
    return <div className={"my-auto flex flex-row"}>
        <Timer/>
        <div className={"my-auto text-left ml-1"}>
            {formatDuration(props.build?.duration)}
        </div>
    </div>;
}