import * as React from "react";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Title from "./Title";

// Generate Order Data
function createData(
  id: number,
  test: string,
  prodPassRate: string,
  previewPassRate: string,
  paymentMethod: string
) {
  return { id, test, prodPassRate, previewPassRate, paymentMethod };
}

const rows = [
  createData(0, "AddAdditionalJob", "75%", "25%", "25%"),
  createData(1, "ChangeJob", "75%", "25%", "50%"),
  createData(2, "HireWithProposeCompensation", "25%", "50%", "0%"),
  createData(3, "HireWithChangePersonalInformation", "0%", "0%", "100%"),
  createData(4, "ExternalJobApplication", "25%", "25%", "75%"),
];

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

export default function Orders() {
  return (
    <>
      <Title>Test Results</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell width={"40%"}>Test</TableCell>
            <TableCell>4 Day Pass Rate (Prod)</TableCell>
            <TableCell>4 Day Pass Rate (Preview)</TableCell>
            <TableCell>First Exec Failure Rate</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.test}</TableCell>
              <TableCell>{row.prodPassRate}</TableCell>
              <TableCell>{row.previewPassRate}</TableCell>
              <TableCell>{row.paymentMethod}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Link color="primary" href="#" onClick={preventDefault} sx={{ mt: 3 }}>
        See all results
      </Link>
    </>
  );
}
