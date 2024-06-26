interface DrawCrossTest {
    stroke: string;
}

export default function HorizontalRaySvg(props: DrawCrossTest) {
    const { stroke } = props;
    return (
        <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                d='M7.28564 12.8571H21.4285V12H7.28564V12.8571Z'
                fill={stroke}
            />
            <path
                d='M5.57132 13.7143C6.28104 13.7143 6.85704 13.1383 6.85704 12.4286C6.85704 11.7188 6.28104 11.1428 5.57132 11.1428C4.86161 11.1428 4.28561 11.7188 4.28561 12.4286C4.28561 13.1383 4.86161 13.7143 5.57132 13.7143ZM5.57132 14.5714C4.38761 14.5714 3.42847 13.6123 3.42847 12.4286C3.42847 11.2448 4.38761 10.2857 5.57132 10.2857C6.75504 10.2857 7.71418 11.2448 7.71418 12.4286C7.71418 13.6123 6.75504 14.5714 5.57132 14.5714Z'
                fill={stroke}
            />
        </svg>
    );
}
