import * as React from "react";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Title from "./Title";

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

export default function Deposits() {
  return (
    <>
      <Title>Recent Double Failures</Title>
      <Typography component="p" fontSize={14} sx={{ flex: 1 }}>
        • AddAdditionalJob
        <br /> • HireWithProposeCompensation
      </Typography>
      <div>
        <Link color="primary" href="#" onClick={preventDefault}>
          Re-run these double failures
        </Link>
      </div>
    </>
  );
}
