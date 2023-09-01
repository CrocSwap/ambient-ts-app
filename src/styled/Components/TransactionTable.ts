import styled from 'styled-components';
import { FlexContainer, GridContainer } from '../Common';

export const ClearButton = styled.button`
    background: var(--dark2);
    width: 40px;
    border: none;
    outline: none;
    display: flex;
    align-items: center;
    box-shadow: 2px 1000px 1px var(--dark2) inset;
    transition: all var(--animation-speed) ease-in-out;

    height: 23px;
    padding: 5px 8px;
    text-decoration: none;
    border-radius: 6.25rem;
    cursor: pointer;
    font-size: 10px;
    color: var(--text2);

    &:hover {
        opacity: 0.8;
    }
`;

export const TransactionRow = styled(GridContainer)<{
    size: 'small' | 'medium' | 'large';
    header?: boolean;
    active?: boolean;
    user?: boolean;
    placeholder?: boolean;
}>`
    ${({ size }) =>
        size === 'small'
            ? `grid-template-columns:
            minmax(68px, 2.6fr) minmax(30px, 1.3fr)
        minmax(90px, 1fr) minmax(30px, 2fr)`
            : size === 'medium'
            ? `grid-template-columns:
       minmax(90px, 2.6fr) minmax(80px, 1.3fr)
        minmax(80px, 1fr) minmax(80px, 1.4fr) minmax(90px, 1.6fr) minmax(78px, 25%)`
            : `grid-template-columns:
        minmax(78px, 1.3fr) minmax(90px, 1fr) minmax(80px, 1fr)
        minmax(80px, 1fr) minmax(64px, 1.5fr) minmax(65px, 1.3fr) minmax(
            80px,
            1.7fr
        )
        minmax(86px, 2.2fr) minmax(80px, 2.2fr) minmax(100px, 20%)`};

    position: relative;
    width: 100%;
    min-height: 35px;
    transition: all var(--animation-speed) ease-in-out;

    padding: 0 8px 4px 8px;
    gap: 4px;

    & > * {
        font-weight: 300;
        font-size: var(--body-size);
        line-height: var(--body-lh);
        text-transform: capitalize;
        text-overflow: ellipsis;
        overflow: hidden;
        margin: auto 0;
    }

    &:focus-visible,
    & *:focus-visible {
        border: 1px solid var(--text1);
    }

    ${({ header, active, user, placeholder }) => `
        ${
            header &&
            `
            min-height: 0;
        `
        }
        ${
            active &&
            `
            background-image: linear-gradient(
                to right,
                rgba(255, 255, 255, 0) 50%,
                var(--dark2) 50%
            );
            background-position: -0% 0;
            background-size: 200% auto;
            transition: background-position 0.5s ease-out;

            background-position: -99.99% 0;
        `
        };

        ${
            user &&
            `
            border-left: 2px solid var(--text1);
        `
        };

        ${
            placeholder &&
            `
            background-color: var(--dark2);
            color: var(--text2);
            -webkit-mask: linear-gradient(
                    -60deg,
                    black 30%,
                    rgba(119, 117, 117, 0.333),
                    black 70%
                )
                right/300% 100%;
            background-repeat: no-repeat;
            animation: shimmer 2s infinite;

            @keyframes shimmer {
                100% {
                    -webkit-mask-position: left;
                }
            }
        `
        }
    `}
`;

export const TransactionItem = styled(FlexContainer)<{
    type?: 'add' | 'claim' | 'harvest' | 'remove' | 'buy' | 'sell';
    hover?: boolean;
}>`
    ${({ hover, type }) => `
        ${
            hover &&
            `
            &:hover {
                -webkit-mask-image: linear-gradient(
                    -75deg,
                    rgba(0, 0, 0, 0.6) 30%,
                    black 50%,
                    rgba(0, 0, 0, 0.6) 70%
                );
                -webkit-mask-size: 200%;
                animation: shine 1.5s infinite;
            }
            
            @-webkit-keyframes shine {
                from {
                    -webkit-mask-position: 150%;
                }
            
                to {
                    -webkit-mask-position: -50%;
                }
            }
        `
        };

        ${
            type && type === 'add'
                ? 'color: var(--accent3)'
                : type === 'claim' || type === 'remove'
                ? 'color: var(--accent4)'
                : type === 'buy'
                ? 'color: var(--accent5)'
                : type === 'sell'
                ? 'color: var(--accent1)'
                : ''
        };
    `}
`;

export const ViewMoreButton = styled.button`
    background: var(--dark2);
    border: none;
    outline: none;
    box-shadow: 2px 1000px 1px var(--dark2) inset;
    transition: all var(--animation-speed) ease-in-out;
    white-space: nowrap;
    height: 23px;
    padding: 1px 12px;
    text-decoration: none;
    border-radius: 6.25rem;
    cursor: pointer;
    font-size: 11px;
    color: var(--text2);

    &:hover {
        color: var(--text1);
    }
`;
