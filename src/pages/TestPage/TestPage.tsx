import styles from './TestPage.module.css';
import 'intro.js/introjs.css';
import { useContext, useState, ChangeEvent } from 'react';
import { UserPreferenceContext } from '../../contexts/UserPreferenceContext';
import { Pagination } from '@mui/material';
import { default as data } from './mock_data.json';
import usePagination from '../../components/Global/Pagination/usePagination';
import useWindowDimensions from '../../utils/hooks/useWindowDimensions';
// eslint-disable-next-line

export default function TestPage() {
    const rowsPerPageOptions = [5, 10, 20, 25, 30, 35, 40, 45, 50, 100];

    const RowsPerPageDropdown = ({
        value,
        onChange,
    }: {
        value: number;
        onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    }) => {
        return (
            <div>
                <label htmlFor='rows-per-page-select'>Rows per page:</label>
                <select
                    id='rows-per-page-select'
                    value={value}
                    onChange={onChange}
                >
                    {rowsPerPageOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>
        );
    };

    // ------------------------------------

    const { bypassConfirmSwap } = useContext(UserPreferenceContext);
    const [page, setPage] = useState(1);
    // const PER_PAGE = 24;
    const { height } = useWindowDimensions();

    const showColumns = false;
    const isAccountView = false;
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const count = Math.ceil(data.length / rowsPerPage);
    const _DATA = usePagination(data, rowsPerPage);

    const handleChange = (e: React.ChangeEvent<any>, p: number) => {
        setPage(p);
        _DATA.jump(p);
    };

    const handleChangeRowsPerPage = (
        event:
            | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            | React.ChangeEvent<HTMLSelectElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <section className={styles.main}>
            <ul style={{ color: 'white' }}>
                {_DATA.currentData.map((v: any) => (
                    <li key={v.sku}>{v.sku}</li>
                ))}
            </ul>

            <Pagination
                count={count}
                size='large'
                page={page}
                // variant="outlined"
                shape='circular'
                color='secondary'
                onChange={handleChange}
                showFirstButton
                showLastButton
            />

            <div>
                Showing {`${_DATA.showingFrom}`} to {`${_DATA.showingTo}`} of{' '}
                {`${_DATA.totalItems}`}
            </div>

            <RowsPerPageDropdown
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
            />
        </section>
    );
}
