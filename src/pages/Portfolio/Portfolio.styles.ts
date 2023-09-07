import styled from 'styled-components';
import { FlexContainer } from '../../styled/Common';

export const PortfolioContainer = styled(FlexContainer)`
    transition: all var(--animation-speed) ease-in-out;
    height: calc(100vh - 56px);
    @media only screen and (max-width: 600px) {
        overflow-y: hidden;
        max-height: calc(100vh - 7.5rem);
    }
`;

export const PortfolioTabsContainer = styled.div<{
    fullLayoutContainer: boolean;
    active: boolean;
}>`
    @media (min-width: 1200px) {
        width: 100%;
        display: grid;
        transition: all var(--animation-speed) ease-in-out;
        overflow: hidden;
        flex: 1;

        /* FullLayout styles */
        grid-template-columns: auto 36px;
        column-gap: 16px;

        /* TabsExchange styles if fullLayoutContainer prop is false */
        ${(props) =>
            !props.fullLayoutContainer &&
            `
            grid-template-columns: auto 380px;
            margin-left: 4px;
            gap: 1rem;
        `}

        ${({ active, fullLayoutContainer }) => {
            if (!active) {
                return `
                display: grid;
                grid-template-columns: auto ;
                column-gap: 16px;
                overflow: hidden;
                flex: 1;
                `;
            } else if (fullLayoutContainer) {
                return `
                    width: 100%;
                    display: grid;
                    transition: all var(--animation-speed) ease-in-out;
                    overflow: hidden;
                    grid-template-columns: auto 36px;
                    column-gap: 16px;
                    flex: 1;
                `;
            } else {
                return `
                        width: 100%;
        flex: 1;
        grid-template-columns: auto auto;
        margin-left: 4px;
        gap: 1rem;
                width: 100%;
        display: grid;
        transition: all var(--animation-speed) ease-in-out;
        overflow: hidden;
                grid-template-columns: auto 380px;

                `;
            }
        }}
    }
`;
