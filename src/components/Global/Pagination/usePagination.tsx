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
}

function usePagination<T>(
    data: T[],
    itemsPerPage: number,
): PaginationResult<T> {
    const [currentPage, setCurrentPage] = useState<number>(1);

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

    console.log({ currentPage });

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
    };
}

export default usePagination;
