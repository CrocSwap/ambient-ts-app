interface DrawCrossTest {
    stroke: string;
}

export default function DpRangeSvg(props: DrawCrossTest) {
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
                d='M5.57153 19.7143V20.5714H20.5715V5.57141H19.7144V19.7143H5.57153Z'
                fill={stroke}
            />
            <path
                d='M18.4287 4.28573V3.42859H3.42871V18.4286H4.28585V4.28573H18.4287Z'
                fill={stroke}
            />
            <path
                d='M3.85721 21.4286C4.56693 21.4286 5.14293 20.8526 5.14293 20.1429C5.14293 19.4332 4.56693 18.8572 3.85721 18.8572C3.1475 18.8572 2.5715 19.4332 2.5715 20.1429C2.5715 20.8526 3.1475 21.4286 3.85721 21.4286ZM3.85721 22.2857C2.6735 22.2857 1.71436 21.3266 1.71436 20.1429C1.71436 18.9592 2.6735 18 3.85721 18C5.04093 18 6.00007 18.9592 6.00007 20.1429C6.00007 21.3266 5.04093 22.2857 3.85721 22.2857ZM20.1429 5.14287C20.8526 5.14287 21.4286 4.56687 21.4286 3.85715C21.4286 3.14744 20.8526 2.57144 20.1429 2.57144C19.4332 2.57144 18.8572 3.14744 18.8572 3.85715C18.8572 4.56687 19.4332 5.14287 20.1429 5.14287ZM20.1429 6.00001C18.9592 6.00001 18.0001 5.04087 18.0001 3.85715C18.0001 2.67344 18.9592 1.71429 20.1429 1.71429C21.3266 1.71429 22.2858 2.67344 22.2858 3.85715C22.2858 5.04087 21.3266 6.00001 20.1429 6.00001Z'
                fill={stroke}
            />
            <path
                d='M11.1428 7.71429V18.8572H12V7.71429H11.1428Z'
                fill={stroke}
            />
            <path
                d='M11.5716 5.14288L13.7144 7.71431H9.42871L11.5716 5.14288Z'
                fill={stroke}
            />
            <path d='M16.2857 12H5.14282V12.8571H16.2857V12Z' fill={stroke} />
            <path
                d='M16.2859 14.5714V10.2857L18.8573 12.4286L16.2859 14.5714Z'
                fill={stroke}
            />
        </svg>
    );
}
