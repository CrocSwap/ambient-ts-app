interface DrawCrossTest {
    stroke: string;
}

export default function DrawCross(props: DrawCrossTest) {
    const { stroke } = props;
    return (
        <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <g clipPath='url(#clip0_7255_86016)'>
                <path
                    d='M14.5 12L20.75 12'
                    stroke={stroke}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                />
                <path
                    d='M3.25 12H9.5'
                    stroke={stroke}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                />
                <path
                    d='M12 3.25V9.5'
                    stroke={stroke}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                />
                <path
                    d='M12 14.5V20.75'
                    stroke={stroke}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                />
            </g>
            <defs>
                <clipPath id='clip0_7255_86016'>
                    <rect
                        width='20'
                        height='20'
                        fill='white'
                        transform='translate(2 2)'
                    />
                </clipPath>
            </defs>
        </svg>
    );
}
