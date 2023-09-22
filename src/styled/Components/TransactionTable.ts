import styled from 'styled-components/macro';
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

export const Row = styled(GridContainer)<{
    size: 'small' | 'medium' | 'large';
    account?: boolean;
    header?: boolean;
    active?: boolean;
    user?: boolean;
    placeholder?: boolean;
}>`
    position: relative;
    width: 100%;
    min-height: 35px;
    transition: all var(--animation-speed) ease-in-out;

    padding: 0 8px;
    gap: 4px;
    cursor: pointer;

    & > * {
        font-weight: 300;
        font-size: var(--body-size);
        line-height: var(--body-lh);
        text-transform: capitalize;
        text-overflow: ellipsis;
        margin: auto 0;
        padding-top: 2px;
        padding-bottom: 2px;
    }

    &:focus-visible,
    & *:focus-visible {
        border: 1px solid var(--text1);
    }

    &:hover {
        background: var(--dark2);
    }

    ${({ header, active, user, placeholder }) => `
        ${header && 'min-height: 0'};
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
        };
    `}
`;

export const TransactionRow = styled(Row)`
    ${({ size, account }) =>
        account
            ? size === 'small'
                ? `grid-template-columns: minmax(55px, 1.5fr)
                    minmax(85px, 1.5fr) minmax(45px, 1.3fr)
                    minmax(90px, 1fr) minmax(30px, 1fr)`
                : size === 'medium'
                ? `grid-template-columns: minmax(55px, 1.5fr)
                        minmax(85px, 1.5fr) minmax(80px, 1.3fr)
                        minmax(80px, 1fr) minmax(80px, 1.4fr) minmax(90px, 1.6fr) minmax(30px, 25%)`
                : `grid-template-columns:
                minmax(80px, 1fr) minmax(90px, 1fr) minmax(80px, 1fr)
                        minmax(80px, 1fr) minmax(64px, 1.5fr) minmax(65px, 1.3fr) minmax(80px,1.7fr)
                        minmax(86px, 2.2fr) minmax(80px, 2.2fr) minmax(100px, 20%)`
            : size === 'small'
            ? `grid-template-columns:
                    minmax(68px, 1.5fr) minmax(30px, 1.3fr)
                    minmax(90px, 1fr) minmax(30px, 2fr)`
            : size === 'medium'
            ? `grid-template-columns:
                        minmax(90px, 1.5fr) minmax(80px, 1.3fr)
                        minmax(80px, 1fr) minmax(80px, 1.4fr) minmax(90px, 1.6fr) minmax(78px, 25%)`
            : `grid-template-columns:
            minmax(80px, 1fr) minmax(90px, 1fr) minmax(80px, 1fr)
                        minmax(80px, 1fr) minmax(64px, 1.5fr) minmax(65px, 1.3fr) minmax(80px,1.7fr)
                        minmax(86px, 2.2fr) minmax(80px, 2.2fr) minmax(100px, 20%)`};
`;

export const OrderRow = styled(Row)`
    ${({ size, account }) =>
        account
            ? size === 'small'
                ? 'grid-template-columns: minmax(55px, 1fr) minmax(80px, 1fr) 1fr minmax(90px, 1fr) minmax(30px, 1fr)'
                : size === 'medium'
                ? 'grid-template-columns: minmax(55px, 1.5fr) minmax(80px, 1.5fr) 1.2fr 1.1fr 1.4fr 1.6fr 1fr minmax(30px, 2fr)'
                : `grid-template-columns:
                    minmax(80px, 1fr) minmax(100px, 1fr) minmax(125px, 1fr)
                    minmax(80px, 1fr) minmax(64px, 1fr) minmax(64px, 1fr) minmax(100px,1fr) 2fr 2fr 1.2fr 14%`
            : size === 'small'
            ? 'grid-template-columns: minmax(80px, 2.2fr) 1fr 1.8fr minmax(30px, 1fr)'
            : size === 'medium'
            ? 'grid-template-columns: minmax(80px, 1.5fr) 1.2fr 1.1fr 1.4fr 1.6fr 1fr minmax(30px, 2fr)'
            : `grid-template-columns:
                        minmax(80px, 1fr) minmax(100px, 1fr) minmax(125px, 1fr)
                        minmax(80px, 1fr) minmax(64px, 1fr) minmax(64px, 1fr) minmax(100px,1fr)2fr 2fr 1.2fr 14%`};
`;

export const RangeRow = styled(Row)<{
    leaderboard?: boolean;
}>`
    ${({ size, leaderboard, account, header }) => `
        ${
            account
                ? size === 'small'
                    ? `grid-template-columns: minmax(55px, 1fr)
                        minmax(80px, 1fr) minmax(60px, 1fr) minmax(50px, 1fr)
                        30px minmax(30px, 1.5fr)`
                    : size === 'medium'
                    ? `grid-template-columns: minmax(40px, 1fr)
                        minmax(80px, 1fr) minmax(72px, 1fr) minmax(78px, 1fr)
                        minmax(86px, 1fr) minmax(44px, 1fr) minmax(25px, 1fr) minmax(100px, 1fr)`
                    : ` grid-template-columns:
                        minmax(80px, 1fr) minmax(100px, 1fr) minmax(125px, 1fr)
                        minmax(90px, 1fr) minmax(90px, 1fr) minmax(90px, 1fr) minmax(100px, 1fr)
                        minmax(100px, 1fr) minmax(60px, 1fr) minmax(60px, 1fr) minmax(107px, 2fr)`
                : !leaderboard
                ? size === 'small'
                    ? `grid-template-columns:
                            minmax(80px, 1fr) minmax(60px, 1fr) minmax(50px, 1fr)
                            minmax(20px, 1fr) minmax(30px, 20%)`
                    : size === 'medium'
                    ? `grid-template-columns:
                                minmax(80px, 1fr) minmax(72px, 1fr) minmax(78px, 1fr)
                                minmax(86px, 1fr) minmax(44px, 1fr) minmax(38px, 1fr) minmax(100px, 1fr)`
                    : ` grid-template-columns:
                                minmax(80px, 1fr) minmax(100px, 1fr) minmax(125px, 1fr)
                                minmax(90px, 1fr) minmax(90px, 1fr) minmax(90px, 1fr) minmax(100px, 1fr)
                                minmax(100px, 1fr) minmax(60px, 1fr) minmax(60px, 1fr) minmax(107px, 2fr)`
                : size === 'small'
                ? `grid-template-columns:
                        minmax(80px, 1fr) minmax(60px, 1fr) minmax(50px, 1fr)
                        minmax(20px, 1fr) minmax(30px, 20%)`
                : size === 'medium'
                ? `grid-template-columns:
                            minmax(80px, 1fr) minmax(72px, 1fr) minmax(78px, 1fr)
                            minmax(86px, 1fr) minmax(44px, 1fr) minmax(38px, 1fr) minmax(100px, 1fr)`
                : ` grid-template-columns: 50px
                            minmax(80px, 1fr) minmax(100px, 1fr) minmax(125px, 1fr)
                            minmax(90px, 1fr) minmax(90px, 1fr) minmax(90px, 1fr) minmax(100px, 1fr)
                            minmax(100px, 1fr) minmax(60px, 1fr)  minmax(107px, 2fr)`
        };
        
        ${
            leaderboard &&
            !header &&
            `&:nth-child(1) {
                    background: linear-gradient(
                        90deg,
                        rgba(212, 175, 55, 0.65) 0%,
                        rgba(255, 170, 0, 0.08) 20%,
                        rgba(209, 142, 10, 0) 100%
                    );
                    transition: background 0.5s ease-out;
                }
                
                &:nth-child(2) {
                    background: linear-gradient(
                        90deg,
                        rgba(224, 224, 224, 0.35) 0%,
                        rgba(224, 224, 224, 0.08) 20%,
                        rgba(224, 224, 224, 0) 100%
                    );
                    transition: background 0.5s ease-out;
                }

                &:nth-child(3) {
                    background: linear-gradient(
                        90deg,
                        rgba(176, 141, 87, 0.35) 0%,
                        rgba(255, 152, 56, 0.08) 20%,
                        rgba(255, 152, 56, 0) 100%
                    );
                    transition: background 0.5s ease-out;
                }`
        }
    `};
`;

export const RowItem = styled(FlexContainer)<{
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
