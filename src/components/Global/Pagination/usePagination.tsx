import { useState, Dispatch, SetStateAction } from 'react';

interface PaginationResult<T> {
    next: () => void;
    prev: () => void;
    jump: (page: number) => void;
    currentData: T[];
    currentPage: number;
    maxPage: number;
    showingFrom: number;
    showingTo: number;
    totalItems: number;
    setCurrentPage: Dispatch<SetStateAction<number>>;
    rowsPerPage: number;
    setRowsPerPage: Dispatch<SetStateAction<number>>;
    count: number;
}

function usePagination<T>(
    data: T[],
    isScreenShort: boolean,
    isScreenTall: boolean,
): PaginationResult<T> {
    const DEFAULT_PAGE_COUNT: number = isScreenShort
        ? 5
        : isScreenTall
        ? 20
        : 10;

    const [rowsPerPage, setRowsPerPage] = useState<number>(DEFAULT_PAGE_COUNT);

    const count = Math.ceil(data.length / rowsPerPage);

    const [currentPage, setCurrentPage] = useState<number>(1);

    const maxPage: number = Math.ceil(data.length / rowsPerPage);
    const showingFrom: number = (currentPage - 1) * rowsPerPage + 1;
    const showingTo: number = Math.min(
        showingFrom + rowsPerPage - 1,
        data.length,
    );
    const totalItems: number = data.length;

    const currentData = (): T[] => {
        const begin: number = (currentPage - 1) * rowsPerPage;
        const end: number = begin + rowsPerPage;
        return data.slice(begin, end);
    };

    function next(): void {
        setCurrentPage((currentPage) => Math.min(currentPage + 1, maxPage));
    }

    function prev(): void {
        setCurrentPage((currentPage) => Math.max(currentPage - 1, 1));
    }

    function jump(page: number): void {
        const pageNumber: number = Math.max(1, page);
        // eslint-disable-next-line
        setCurrentPage((currentPage) => Math.min(pageNumber, maxPage));
    }

    return {
        next,
        prev,
        jump,
        currentData: currentData(),
        currentPage,
        maxPage,
        showingFrom,
        showingTo,
        totalItems,
        setCurrentPage,
        rowsPerPage,
        setRowsPerPage,
        count,
    };
}

export default usePagination;
