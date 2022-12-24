import * as React from "react";
import { useTheme } from "@mui/material/styles";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
} from "recharts";
import Title from "./Title";

// Generate Sales Data
function createData(date: string, amount?: number) {
  return { date, amount };
}

const data = [
  createData("10/10", 7),
  createData("11/10", 5),
  createData("12/10", 6),
  createData("13/10", 13),
  createData("14/10", 9),
  createData("15/10", 6),
  createData("16/10", 4),
  createData("17/10", 3),
];

export default function Chart() {
  const theme = useTheme();

  return (
    <>
      <Title>Today</Title>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 16,
            right: 16,
            bottom: 0,
            left: 24,
          }}
        >
          <XAxis
            dataKey="date"
            stroke={theme.palette.text.secondary}
            style={theme.typography.body2}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            style={theme.typography.body2}
          >
            <Label
              angle={270}
              position="left"
              style={{
                textAnchor: "middle",
                fill: theme.palette.text.primary,
                ...theme.typography.body1,
              }}
            >
              Total Double Failures
            </Label>
          </YAxis>
          <Line
            isAnimationActive={true}
            type="monotone"
            dataKey="amount"
            stroke={theme.palette.primary.main}
            activeDot={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
