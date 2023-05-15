import { useEffect, useState } from 'react';

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
}

function usePagination<T>(
    data: T[],
    itemsPerPage: number,
): PaginationResult<T> {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [resetPage, setResetPage] = useState<boolean>(false);

    const maxPage: number = Math.ceil(data.length / itemsPerPage);
    const showingFrom: number = (currentPage - 1) * itemsPerPage + 1;
    const showingTo: number = Math.min(
        showingFrom + itemsPerPage - 1,
        data.length,
    );
    const totalItems: number = data.length;

    const currentData = (): T[] => {
        const begin: number = (currentPage - 1) * itemsPerPage;
        const end: number = begin + itemsPerPage;
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

    useEffect(() => {
        if (resetPage) {
            setCurrentPage(1);
            setResetPage(false);
        }
    }, [resetPage]);

    useEffect(() => {
        if (currentPage > maxPage) {
            setResetPage(true);
        }
    }, [currentPage, maxPage]);

    useEffect(() => {
        if (itemsPerPage !== data.length) {
            setResetPage(true);
        }
    }, [itemsPerPage, data.length]);

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
    };
}

export default usePagination;
