import styled from 'styled-components';

// export const PortfolioTabsPortfolioTabsContainer = styled.div`
//     width: 100%;
//     height: 100%;
//     overflow: hidden;

//     border-radius: var(--border-radius);
//     background: var(--dark1);

//     align-items: stretch;

//     @media only screen and (min-device-width: 320px) and (max-device-width: 1200px) and (-webkit-min-device-pixel-ratio: 2) {
//         margin: 0 auto;
//         width: 100%;
//         padding: 0 0.1rem;
//     }
// `;

export const GasPump = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;

    color: var(--text2);
    font-size: var(--body-size);
    line-height: var(--body-lh);
`;

export const SVGContainer = styled.div`
    background: var(--dark1);
    width: 20px;
    height: 20px;
    padding-right: 6px;

    display: flex;
    justify-content: center;
    align-items: center;
`;

export const CurrencyQuantityInput = styled.input`
    font-weight: 300;
    font-size: var(--header2-size);
    line-height: 22px;
    color: white;
    text-align: start;
    width: 100%;
    height: calc(1em + 0.65rem + 2px);
    padding: 0.375rem 0.75rem;
    border: none;
    border-radius: 0.25rem;
    outline: 0;
    background-color: transparent;
    background-clip: padding-box;
    transition:
        border-color 0.15s ease-in-out,
        box-shadow 0.15s ease-in-out;

    &::placeholder {
        color: var(--text2);
        font-weight: 300;
        font-size: var(--header2-size);
        line-height: 22px;
    }
`;

export const MaxButton = styled.button<{ disabled?: boolean; width?: string }>`
    font-size: var(--body-size);
    line-height: var(--body-lh);
    color: var(--text1);
    outline: none;
    border: none;

    color: var(--text1);

    width: ${({ width }) => width || '60px'};
    display: flex;
    justify-content: left;
    align-items: center;

    max-height: 20px;
    transition: var(--transition);
    background: transparent;
    border-radius: var(--border-radius);

    ${({ disabled }) => (disabled ? '' : 'cursor: pointer;')}

    &:hover {
        color: var(--accent1);
    }
`;

// export const PortfolioControlContainer = styled.div`
//     cursor: pointer;
//     display: none;
//     position: absolute;
//     right: 8px;
//     top: 8px;

//     @media only screen and (min-width: 1200px) {
//         display: flex;
//         border-radius: var(--border-radius);
//     }
// `;

// export const PortfolioMotionContainer = styled(motion.div)<
//     ContainerProps & BreakpointProps
// >`
//     ${(props) => ContainerStyles({ ...props, ...{ display: 'flex' } })}
//     ${Breakpoint}
// `;

// export const PortfolioMotionSubContainer = styled(motion.div)<
//     ContainerProps & BreakpointProps
// >`
//     ${ContainerStyles}
//     ${Breakpoint}
//     @media only screen and (max-width: 600px) {
//         border-radius: var(--border-radius);
//         color: blue;
//     }
// `;

// export const PortfolioInfoText = styled.div`
//     font-size: var(--body-size);
//     line-height: 22.5px;
//     color: var(--text2);
//     background: var(--dark1);
//     font-weight: 300;
//     text-align: center;
//     padding: 8px;
//     border-radius: var(--border-radius);
//     margin-bottom: 8px;

//     /* prevents the exchange balance sidebar from expanding downward on open */
//     max-height: 80px;
//     text-overflow: ellipsis;
//     overflow: hidden;
// `;

// export const PortfolioBannerMainContainer = styled(motion.main)`
//     display: flex;
//     flex-direction: column;
//     gap: 8px;
//     background: rgba(18, 18, 26, 0.3);
//     padding: 4px;

//     /* blur/card */
//     backdrop-filter: blur(2px);

//     @media only screen and (min-width: 768px) {
//         width: 380.16px;
//         border-radius: 50px 4px 4px 50px;
//     }
// `;

// export const PortfolioBannerRectangleContainer = styled.div`
//     font-family: var(--font-family);
//     width: 100%;
//     height: 100px;
//     margin-top: 4px;

//     -webkit-background-size: cover;
//     -moz-background-size: cover;
//     -o-background-size: cover;
//     background-size: cover;

//     justify-content: space-between;
//     align-items: flex-end;

//     padding: 1rem;
//     position: relative;

//     display: flex;

//     background-color: var(--dark1);
//     @media only screen and (min-width: 768px) {
//         border-radius: 24px 24px 0px 0px;
//         height: 150px;
//         margin-top: 0;
//     }

// `;

// export const PortfolioBannerLevelContainer = styled.div<{
//     isAccountPage?: boolean;
// }>`
//     display: flex;
//     background: ${({ isAccountPage }) =>
//         isAccountPage ? 'rgba(18, 18, 26, 0.90)' : 'rgba(23, 29, 39, 0.7)'};
//     border-radius: 8px;
//     backdrop-filter: 10px;
//     padding: 4px 8px;
//     height: auto;
//     display: none;
//     z-index: 2;

//     @media only screen and (min-width: 800px) {
//         display: flex;
//         flex-shrink: 0;
//     }
// `;

// export const PortfolioContainer = styled(FlexContainer)`
//     transition: var(--transition);
//     height: calc(100vh - 56px);
//     @media only screen and (max-width: 600px) {
//         overflow-y: hidden;
//         max-height: calc(100svh - 7.5rem);
//     }
//     background-color: 'red';
// `;

// export const PortfolioTabsContainer = styled.div<{
//     fullLayoutContainer: boolean;
//     active: boolean;
// }>`
//     @media (min-width: 1200px) {
//         width: 100%;
//         display: grid;
//         transition: var(--transition);
//         overflow: hidden;
//         flex: 1;

//         /* FullLayout styles */
//         grid-template-columns: auto 36px;
//         column-gap: 16px;

//         /* TabsExchange styles if fullLayoutContainer prop is false */
//         ${(props) =>
//             !props.fullLayoutContainer &&
//             `
//             grid-template-columns: auto 380px;
//             gap: 1rem;
//         `}

//         ${({ active, fullLayoutContainer }) => {
//             if (!active) {
//                 return `
//                 display: grid;
//                 grid-template-columns: auto ;
//                 column-gap: 16px;
//                 overflow: hidden;
//                 flex: 1;
//                 `;
//             } else if (fullLayoutContainer) {
//                 return `
//                     width: 100%;
//                     display: grid;
//                     transition: var(--transition);
//                     overflow: hidden;
//                     grid-template-columns: auto 36px;
//                     column-gap: 16px;
//                     flex: 1;
//                 `;
//             } else {
//                 return `
//                         width: 100%;
//         flex: 1;
//         grid-template-columns: auto auto;
//         gap: 1rem;
//                 width: 100%;
//         display: grid;
//         transition: var(--transition);
//         overflow: hidden;
//                 grid-template-columns: auto 380px;

//                 `;
//             }
//         }}
//     }
// `;

// export const MobileButton = styled.button<{ active: boolean }>`
//     font-size: var(--body-size);
//     line-height: var(--body-lh);
//     padding: 4px 1.5rem;

//     cursor: pointer;
//     transition: all 0.3s ease-in-out;
//     border: none;
//     outline: none;

//     &:hover {
//         color: var(--text1);
//     }

//     ${({ active }) => `
//         color: ${active ? 'black' : 'var(--text1)'};
//         background: ${active ? 'var(--accent1)' : 'transparent'};
//     `}
// `;

// export const ProfileSettingsContainer = styled.div<{ placement: boolean }>`
//     display: flex;
//     flex-direction: column;
//     justify-content: center;
//     align-items: center;

//     height: 65px;
//     width: 65px;

//     ${({ placement }) => {
//         if (placement) {
//             return `
//             transform: translate(0%, 23%);
//             `;
//         }
//     }}
// `;
