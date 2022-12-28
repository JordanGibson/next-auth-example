import useSWR from "swr";
import { Prisma, suite } from "@prisma/client";
import { getFetcher } from "./_swrFetcher";

export default function Suites() {
  const { data, error, isLoading } = useSWR(
    "/api/suite",
    getFetcher<suite[]>()
  );
  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;
  return (
    <div>
      {data!.map((x) => (
        <div>{JSON.stringify(x, null, 2)}</div>
      ))}
    </div>
  );
}
