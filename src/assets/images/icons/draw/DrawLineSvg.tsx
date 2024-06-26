interface DrawCrossTest {
    stroke: string;
}

export default function DrawLineSvg(props: DrawCrossTest) {
    const { stroke } = props;
    return (
        <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <g clipPath='url(#clip0_7255_86007)'>
                <path
                    d='M18.6667 7.23811C19.7187 7.23811 20.5715 6.38532 20.5715 5.33335C20.5715 4.28138 19.7187 3.42859 18.6667 3.42859C17.6148 3.42859 16.762 4.28138 16.762 5.33335C16.762 6.38532 17.6148 7.23811 18.6667 7.23811Z'
                    stroke={stroke}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                />
                <path
                    d='M5.33323 20.5714C6.3852 20.5714 7.23799 19.7186 7.23799 18.6667C7.23799 17.6147 6.3852 16.7619 5.33323 16.7619C4.28126 16.7619 3.42847 17.6147 3.42847 18.6667C3.42847 19.7186 4.28126 20.5714 5.33323 20.5714Z'
                    stroke={stroke}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                />
                <line
                    x1='17.1155'
                    y1='6.63926'
                    x2='6.63933'
                    y2='17.1154'
                    stroke={stroke}
                />
            </g>
            <defs>
                <clipPath id='clip0_7255_86007'>
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
