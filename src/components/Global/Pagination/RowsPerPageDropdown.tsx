import { ChangeEvent, Dispatch, SetStateAction } from 'react';

const dropdownStyles = {
    background: 'transparent',
    outline: 'none',
    border: 'none',
    padding: '4px',
    borderRadius: '4px',
    color: 'var(--text2)',
};

export const RowsPerPageDropdown = ({
    rowsPerPage,
    onChange,
    itemCount,
    resetPageToFirst,
    setCurrentPage,
}: {
    rowsPerPage: number;
    onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    itemCount: number;
    resetPageToFirst: () => void;
    setCurrentPage: Dispatch<SetStateAction<number>>;
}) => {
    const generateOptions = (count: number): JSX.Element[] => {
        const DEFAULT_OPTIONS: number[] = [5, 10, 25, 50, 100];

        const maxOptions = 10;
        const increment: number = Math.ceil(count / maxOptions / 5) * 5;
        let options: number[] = [];

        if (count < 1) {
            options = DEFAULT_OPTIONS;
        } else {
            for (
                let i = increment;
                i <= count && options.length < maxOptions;
                i += increment
            ) {
                options.push(i);
            }
            // Add 5 and 10 to the options if they are not already included
            if (!options.includes(5)) {
                options.push(5);
            }
            if (!options.includes(10)) {
                options.push(10);
            }
        }

        // Sort the options in ascending order
        // must sort BEFORE finding index for default selection
        options.sort((a, b) => a - b);

        // index of the last option <= user rows per page preference
        // necessary if persisted preference > current list size
        // in such cases code will use the final option in the array
        const defaultOptionIndex: number = options.findLastIndex(
            (option: number) => option <= rowsPerPage,
        );

        // create and return JSX components
        // will mark the relevant option as the default
        return options.map((option: number, idx: number) => (
            <option
                key={option}
                value={option}
                selected={defaultOptionIndex === idx}
            >
                {option}
            </option>
        ));
    };

    const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
        onChange(event);
        resetPageToFirst();
        setCurrentPage(1);
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                gap: '4px',
            }}
        >
            <label htmlFor='rows-per-page-select'>Rows per page:</label>
            <select
                id='rows-per-page-select'
                onChange={handleSelectChange}
                style={dropdownStyles}
            >
                {generateOptions(itemCount)}
            </select>
        </div>
    );
};
