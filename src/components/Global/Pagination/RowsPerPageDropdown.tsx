import { ChangeEvent } from 'react';

const dropdownStyles = {
    background: 'var(--dark2)',
    outline: 'none',
    border: 'none',
    padding: '4px',
    borderRadius: '4px',
    color: 'var(--text2)',
};

export const RowsPerPageDropdown = ({
    value,
    onChange,
    itemCount,
}: {
    value: number;
    onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    itemCount: number;
}) => {
    const generateOptions = (count: number) => {
        const maxOptions = 10;
        const increment = Math.ceil(count / maxOptions / 5) * 5;
        const options = [];

        for (let i = increment; i <= count; i += increment) {
            options.push(i);
        }

        // Add 5 and 10 to the options if they are not already included
        if (!options.includes(5)) {
            options.push(5);
        }
        if (!options.includes(10)) {
            options.push(10);
        }

        // Sort the options in ascending order
        options.sort((a, b) => a - b);

        return options;
    };

    const rowsPerPageOptions = generateOptions(itemCount);

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
                value={value}
                onChange={onChange}
                style={dropdownStyles}
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
