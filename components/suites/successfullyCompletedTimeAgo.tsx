import {Build} from "../../pages/api/suite/latest/[id]";
import {
    CheckCircleOutlined,
    EmojiFlagsTwoTone,
    Flag,
    FlagOutlined,
    FlagRounded,
    FlagTwoTone
} from "@mui/icons-material";
import React from "react";
import {formatDate} from "../../utils/timeUtils";

export function SuccessfullyCompletedTimeAgo(props: { build: Build }) {
    return <div className={"my-auto flex flex-row"}>
        <FlagOutlined/>
        <div className={"my-auto text-left ml-1"}>
            Completed {formatDate(props.build.end_date)}
        </div>
    </div>;
}