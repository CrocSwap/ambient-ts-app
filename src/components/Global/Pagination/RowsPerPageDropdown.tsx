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
        // default pagination values (more may be added below)
        const options: number[] = [5, 10, 15, 20];

        // last value in `options` array, used to break loop
        let lastOption: number = options[options.length - 1];

        // add options counting by 10 until highest option > number of items
        while (lastOption < count && lastOption < 100) {
            const nextOption = lastOption + 10;
            options.push(nextOption);
            lastOption = nextOption;
        }

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
