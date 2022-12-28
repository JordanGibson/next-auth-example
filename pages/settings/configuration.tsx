import useSWR, { mutate } from "swr";
import { getFetcher } from "../_swrFetcher";
import { suite } from "@prisma/client";
import Link from "next/link";

const putUpdateSuite = async (
  suites: suite[],
  updatedSuite: suite
): Promise<suite[]> => {
  const response = await fetch(`/api/suite/${updatedSuite.id}`, {
    method: "PUT",
    body: JSON.stringify({
      index: updatedSuite.index,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const suite: suite = await response.json();
  return suites.map((x) => {
    return x.id === updatedSuite.id ? suite : x;
  });
};

function SuiteIndexTable() {
  const { data, error, isLoading, mutate } = useSWR<suite[]>(
    "/api/suite",
    getFetcher<suite[]>()
  );
  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  const invertShouldIndexSuite = (suite: suite) => async () => {
    const updatedSuite = { ...suite, index: !suite.index };
    await mutate(async () => putUpdateSuite(data!, updatedSuite), {
      optimisticData: data!.map((item) =>
        item.id === suite.id ? updatedSuite : item
      ),
    });
  };

  return (
    <>
      <div className="text-base rounded-3xl">
        <table className="table min-w-full">
          <thead>
            <tr className={"text-3xl"}>
              <th>Suite</th>
              <th>Scan</th>
            </tr>
          </thead>
          <tbody>
            {data!
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((suite, i) => (
                <tr
                  className={`hover text-sm ${
                    i % 2 == 0 ? "" : ""
                  } cursor-pointer`}
                  onClick={invertShouldIndexSuite(suite)}
                >
                  <td>{suite.name}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={suite.index}
                      className="checkbox"
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function ConfigurationPage() {
  return (
    <>
      <div className="grid grid-cols-5 p-10">
        <div className="col-span-1">
          <ul className="menu flex flex-col p-0 px-4">
            <li className="menu-title">
              <span>Configuration</span>
            </li>
            <li>
              <a href="#suites" className="flex gap-4">
                <span className="flex-1">Suites</span>
              </a>
            </li>
          </ul>
        </div>
        <div className="col-span-4 px-5">
          <SuiteIndexTable />
        </div>
      </div>
    </>
  );
}
