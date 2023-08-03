import styles from './TokensArrow.module.css';
// import { useState } from 'react';
interface TokensArrowPropsIF {
    onlyDisplay?: boolean;
    onClick?: () => void;
    disabled?: boolean;
}
export default function TokensArrow(props: TokensArrowPropsIF) {
    const { onlyDisplay, disabled, onClick } = props;
    return (
        <button
            tabIndex={onlyDisplay ? -1 : 0}
            className={`${styles.container} 
                ${onlyDisplay && styles.display_container} 
                ${disabled && styles.disabled}
            `}
            aria-label='Reverse tokens'
            onClick={onClick}
        >
            <svg
                width='24'
                height='15'
                viewBox='0 0 24 15'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className={styles.token_arrow}
            >
                <path
                    d='M2.82 0.000312805L12 9.16031L21.18 0.000312805L24 2.82031L12 14.8203L0 2.82031L2.82 0.000312805Z'
                    fill='url(#paint0_linear_666_33965)'
                />
                <defs>
                    <linearGradient
                        id='paint0_linear_666_33965'
                        x1='0'
                        y1='7.41031'
                        x2='24'
                        y2='7.41031'
                        gradientUnits='userSpaceOnUse'
                    >
                        <stop stopColor='#7371FC' />
                        <stop offset='0.494792' stopColor='#7371FC' />
                        <stop offset='1' stopColor='#7371FC' />
                    </linearGradient>
                </defs>
            </svg>
        </button>
    );
}
