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
      <div className="text-primary rounded-3xl p-5">
        <table className="table-auto min-w-full border border-2 border-slate-900">
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
                  className={`border border-slate-900 text-sm ${
                    i % 2 == 0 ? "" : ""
                  }`}
                >
                  <td>
                    <label className={"mx-5"} key={suite.id}>
                      {suite.name}
                    </label>
                  </td>
                  <td>
                    <div className="form-control">
                      <label className="label cursor-pointer mx-auto">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-success"
                          checked={suite.index}
                          onChange={invertShouldIndexSuite(suite)}
                        />
                      </label>
                    </div>
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
      <div className="grid grid-cols-5 p-10 mx-auto text-gray-400 min-h-screen">
        <div className="col-span-1 block overflow-y-auto border-r border-white">
          <div className="text-2xl font-semibold text-white">Configuration</div>
          <ul>
            <li>
              <Link
                className="block border-l pl-4 -ml-px hover:border-slate-500 border-slate-100 text-slate-400 hover:text-slate-300"
                href={"#suites"}
              >
                Suites
              </Link>
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
