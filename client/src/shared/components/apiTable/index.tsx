import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import { SortDir } from './types';
import Pagination from './Pagination';
import SortBy from './SortBy';
import ScrollArrow from './ScrollArrow';
import { HeaderRow } from './HeaderRow';
import { apiFetch, API_URL } from 'src/shared/api';
import APIErrorToast from '../apiErrorToast/APIErrorToast';
import { useHistory } from 'react-router-dom';

interface IProps {
  endpoint: string;
  search: string;
  columns: any;
  rowKey: string;
  initialSortBy: string;
  RowComponent: ({ row }: any) => JSX.Element;
  isTransformed: boolean;
  isDrugRecord?: boolean | undefined;
  patientId?: string;
  gestationalAgeUnit?: string;
}

export const APITable = ({
  endpoint,
  search,
  columns,
  rowKey, // a unique value in the row, e.g. patientId for patients
  initialSortBy,
  RowComponent,
  isTransformed,
  isDrugRecord,
  patientId,
  gestationalAgeUnit,
}: IProps) => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDir, setSortDir] = useState(SortDir.ASC);
  const history = useHistory();
  const prevPage = useRef(1);

  const classes = useStyles();

  // when something changes, load new data
  useEffect(() => {
    // if the user changed something other than the page number
    // then reset to page 1
    if (page === prevPage.current && page !== 1) {
      setPage(1);
      return;
    } else {
      prevPage.current = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setLoading(true);

    // allow aborting a fetch early if the user clicks things rapidly
    const controller = new AbortController();

    const fetchOptions = {
      signal: controller.signal,
    };

    const params =
      '?' +
      new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
        search: search,
        sortBy: sortBy,
        sortDir: sortDir,
      });

    apiFetch(API_URL + endpoint + params, fetchOptions)
      .then(async (resp) => {
        const json = await resp.json();
        console.log(json);
        console.log(isDrugRecord);
        if (isDrugRecord === true) {
          setRows(json.drug);
        } else if (isDrugRecord === false) {
          setRows(json.medical);
        } else {
          setRows(json);
        }
        setLoading(false);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setLoadingError(true);
          setLoading(false);
        }
      });

    // if the user does something else, cancel the fetch
    return () => controller.abort();
  }, [endpoint, limit, page, search, sortBy, sortDir, isDrugRecord]);

  const handleSort = (col: string) => {
    if (col === sortBy) {
      // swap direction
      setSortDir(sortDir === SortDir.ASC ? SortDir.DESC : SortDir.ASC);
    } else {
      setSortBy(col);
      setSortDir(SortDir.ASC);
    }
  };

  return (
    <>
      <APIErrorToast
        open={loadingError}
        onClose={() => setLoadingError(false)}
      />
      <div className={classes.loadingWrapper}>
        {loading && <LinearProgress />}
      </div>
      {!isTransformed && (
        <SortBy
          columns={columns}
          sortBy={sortBy}
          sortDir={sortDir}
          handleSort={handleSort}
        />
      )}
      {rows.length ? (
        <div className={isTransformed ? classes.tableWrapper : ''}>
          <table className={classes.table}>
            {isTransformed && (
              <thead>
                <HeaderRow
                  columns={columns}
                  sortBy={sortBy}
                  sortDir={sortDir}
                  handleSort={handleSort}
                />
              </thead>
            )}
            <tbody>
              {rows.map((r: any) => (
                <RowComponent
                  key={r[rowKey]}
                  row={r}
                  patientId={patientId}
                  unit={gestationalAgeUnit}
                  history={history}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={classes.messageWrapper}>
          {loading ? 'Retrieving records...' : 'No records to display.'}
        </div>
      )}
      <Pagination
        dataLen={rows.length}
        page={page}
        limit={limit}
        setPage={setPage}
        setLimit={setLimit}
      />
      <ScrollArrow />
    </>
  );
};

const useStyles = makeStyles({
  loadingWrapper: {
    height: 15,
  },
  tableWrapper: {
    maxHeight: '60vh',
    overflowY: 'auto',
  },
  messageWrapper: {
    textAlign: 'center',
    padding: '15px',
  },
  table: {
    width: '100%',
    textAlign: 'center',
  },
});
