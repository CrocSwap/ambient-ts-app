import { Resizable } from 're-resizable';
import styled from 'styled-components/macro';

export const MainSection = styled.section<{
    isDropdown?: boolean;
    isSmallScreen?: boolean;
}>`
    display: ${(props) => (props.isDropdown ? 'flex' : 'grid')};
    gap: ${(props) => (props.isDropdown ? '8px' : 'initial')};

    grid-template-columns: auto 380px;
    height: ${(props) =>
        props.isDropdown && !props.isSmallScreen
            ? 'calc(100dvh - 85px)'
            : 'calc(100dvh - 150px)'};

    border-top: ${(props) => !props.isDropdown && '1px solid var(--dark2)'};

    @media (max-width: 1200px) {
        display: flex;
        flex-direction: column;
    }

    @media only screen and (max-width: 1279px) {
        padding-left: ${(props) => (props.isSmallScreen ? '' : '30px')};
    }

    @media (max-width: 600px) {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
`;

export const TradeDropdown = styled.div`
    width: 100%;
    position: relative;
    z-index: 1;
    width: 370px;
    text-align: end;
    border-radius: var(--border-radius);
    text-transform: capitalize;
    margin: 0 auto;
    background: var(--dark2);

    @media (max-width: 500px) {
        width: 95%;
    }
`;

export const TradeDropdownButton = styled.button<{ activeText?: boolean }>`
    background: transparent;
    outline: none;
    border: none;
    padding: ${(props) => (props.activeText ? '0 8px' : '8px')};
    cursor: pointer;
    transition: var(--transition);
    border-radius: var(--border-radius);
    text-align: center;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-transform: capitalize;

    color: ${(props) => (props.activeText ? 'var(--text1)' : 'var(--text2)')};
    font-size: ${(props) =>
        props.activeText ? 'var(--header1-size)' : 'inherit'};
`;

export const ResizableContainer = styled(Resizable)<{
    showResizeable: boolean;
}>`
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;

    max-height: calc(100% - 54px);
    min-height: 0px;

    ${({ showResizeable }) =>
        showResizeable &&
        `
    & > div:last-child > * {
        bottom: 0 !important;
        height: 5px !important;
        background-color: var(--dark3);
        z-index: 99;
    }
    
    & > div:last-child > div:nth-child(2), & > div:last-child > div:nth-child(4) {
        z-index: -1;
        display: none;
    }
    `}
`;

export const ChartContainer = styled.div<{ fullScreen: boolean }>`
    ${({ fullScreen }) =>
        fullScreen
            ? `
        transition: var(--transition);
        background: var(--dark2);
        position: fixed;
        width: 100%;
        height: calc(100% - 56px);
        left: 0;
        top: 56px;
        z-index: 10;

        background: var(--dark2);
    `
            : `
        flex: 1 0;
        padding: 0px;

        display: flex;
        flex-direction: column;
        align-items: stretch;
        width: 100%;
        min-height: 200px;
        height: 100%;
        overflow: hidden;

        @media (min-width: 1200px) {
            background: var(--dark2);
            padding: 8px 8px 3px 8px;
        }

        @media ((min-width: 801px) and (max-width:1200px)) {
            padding-bottom: 30px;
        }

        @media (max-width: 320px) {
            padding-bottom: 80px;
        }
    `}

    &::-webkit-scrollbar {
        display: none;
    }
`;
