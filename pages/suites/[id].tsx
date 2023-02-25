import { useRouter } from 'next/router';
import useSWR from 'swr';
import { Endpoints } from '../api/_endpoints';
import { getFetcher } from '../_swrFetcher';
import { Build, LatestBuildsForSuiteResponseType } from '../api/suite/latest/[id]';
import { GetBuildResponseType, GetBuildTableDataResponseType } from '../api/build/[id]';
import { Spinner } from '../../components/common/spinner';
import { suite } from '@prisma/client';
import { ArrowCircleDown, ArrowCircleUp, DoneAll } from '@mui/icons-material';
import { SuccessfullyCompletedTimeAgo } from '../../components/suites/successfullyCompletedTimeAgo';
import { toTitleCase } from '../../lambda/src/utils';
import { useEffect, useState } from 'react';
import {
    ColumnHelper,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import _default from 'chart.js/dist/core/core.interaction';
import x = _default.modes.x;

function getColumns<TValue, TAccessor, TReturn>(columnHelper: ColumnHelper<GetBuildTableDataResponseType>) {
    return [
        columnHelper.accessor(row => row.displayName, {
            id: 'Name',
            cell: info => <i>{info.getValue()}</i>,
            header: () => <span>Test Name</span>,
        }),
        columnHelper.accessor(row => row.duration, {
            id: 'Duration',
            cell: info => <i>{info.getValue()}</i>,
            header: () => <span>Duration</span>,
        }),
        columnHelper.accessor(row => row.order, {
            id: 'Order',
            cell: info => <i>{info.getValue()}</i>,
            header: () => <span>Order</span>,
        }),
    ];
}

function BuildStatistics(props: { build: Build; data: GetBuildResponseType }) {
    const resultTypes = [
        { displayName: 'Double Failures', data: props.data.double_failures },
        { displayName: 'Passed on re-run', data: props.data.passed_rerun },
        { displayName: 'Passed', data: props.data.passed_first_execution },
        { displayName: 'Ignored', data: props.data.ignored },
        { displayName: 'Single failures - no re-run', data: props.data.single_failures },
    ];
    const [activeTab, setActiveTab] = useState(resultTypes[0].displayName);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [data, setData] = useState(resultTypes.find(x => x.displayName == activeTab)!.data);

    useEffect(() => {
        setData(resultTypes.find(y => y.displayName === activeTab)!.data);
    }, [activeTab]);

    const columnHelper = createColumnHelper<GetBuildTableDataResponseType>();
    const columns = getColumns(columnHelper);
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        debugTable: true,
    });
    return (
        <>
            <div className={'card bg-base-100 border p-3'}>
                <div className={'text-xl'}>
                    {toTitleCase(props.build.confidence_level) ?? 'Queued Build'}
                </div>
                <div className={'flex flex-row justify-between'}>
                    <div>
                        <DoneAll className={'text-success'} /> Successfully Configured Tenant
                    </div>
                    <SuccessfullyCompletedTimeAgo
                        build={props.build}
                    ></SuccessfullyCompletedTimeAgo>
                </div>
                <a
                    target="_blank"
                    className={'text-sm max-w-fit text-underline border rounded px-3 py-1 m-2'}
                    href={`https://sysbuild.dev.kainossmart.com/viewLog.html?buildId=${props.build.id}`}
                >
                    View on TeamCity
                </a>
                <div className={'my-3'}>
                    <div className="tabs">
                        {resultTypes
                            .filter(x => x.data.length != 0)
                            .map(x => {
                                const count = x.data.length;
                                return (
                                    <>
                                        <a
                                            className={`tab rounded-xl ${
                                                activeTab == x.displayName
                                                    ? 'tab-active bg-base-200'
                                                    : ''
                                            }`}
                                            onClick={() => {
                                                setActiveTab(x.displayName);
                                            }}
                                        >{`${x.displayName} (${count})`}</a>
                                    </>
                                );
                            })}
                    </div>
                    <div className={'w-full border rounded my-2'}>
                        <div className={'w-full overflow-scroll'}>
                            <table className={'w-full max-h-1/2 overflow-scroll border-collapse'}>
                                <thead>
                                    {table.getFlatHeaders().map(header => (
                                        <th
                                            className={'p-3 text-left bg-base-200'}
                                            key={header.id}
                                            colSpan={header.colSpan}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    {...{
                                                        className: header.column.getCanSort()
                                                            ? 'cursor-pointer select-none'
                                                            : '',
                                                        onClick:
                                                            header.column.getToggleSortingHandler(),
                                                    }}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {{
                                                        asc: <ArrowCircleUp></ArrowCircleUp>,
                                                        desc: <ArrowCircleDown></ArrowCircleDown>,
                                                    }[header.column.getIsSorted() as string] ??
                                                        null}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </thead>
                                <tbody>
                                    {table.getRowModel().rows.map(row => {
                                        return (
                                            <tr key={row.id} className={"hover:bg-base-200 cursor-pointer"}>
                                                {row.getVisibleCells().map(cell => {
                                                    return (
                                                        <td
                                                            className={
                                                                'max-w-[999px] break-all border-y p-2'
                                                            }
                                                            key={cell.id}
                                                        >
                                                            {flexRender(
                                                                cell.column.columnDef.cell,
                                                                cell.getContext()
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function SuiteDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    if (!id) return <Spinner />;
    const { data: suiteData } = useSWR(`${Endpoints.suite}/${id}`, getFetcher<suite>());
    const { data } = useSWR(
        Endpoints.latestBuildsForSuite(id as string),
        getFetcher<LatestBuildsForSuiteResponseType>()
    );

    const { data: prodData } = useSWR(
        () => `/api/build/${data?.prod.id}`,
        getFetcher<GetBuildResponseType>()
    );
    const { data: previewData } = useSWR(
        () => `/api/build/${data?.preview.id}`,
        getFetcher<GetBuildResponseType>()
    );

    if (!data || !prodData || !previewData) return <Spinner />;

    return (
        <>
            <div className={'p-5'}>
                <h1 className={'text-xl'}>{suiteData?.name}</h1>
                <div className={'grid grid-cols-2 gap-4 m-2'}>
                    <BuildStatistics build={data.prod} data={prodData} />
                    <BuildStatistics build={data.preview} data={previewData} />
                </div>
            </div>
        </>
    );
}
