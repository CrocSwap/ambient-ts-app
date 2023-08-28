import { Resizable } from 're-resizable';
import styled from 'styled-components';
import { FlexContainer, Text } from '../Common';

export const MainSection = styled.section`
    display: grid;
    grid-template-columns: auto 380px;
    height: calc(100vh - 56px);

    border-top: 1px solid var(--dark2);

    @media (max-width: 1200px) {
        display: flex;
        flex-direction: column;
    }

    @media only screen and (max-width: 1279px) {
        padding-left: 30px;
    }

    @media (max-width: 600px) {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 0 8px;
    }
`;

export const TradeDropdown = styled.div`
    width: 100%;
    position: relative;
    z-index: 99;
    width: 370px;
    text-align: end;
    border-radius: var(--border-radius);
    text-transform: capitalize;
    margin: 0 auto;
`;

export const TradeDropdownButton = styled.button`
    background: var(--dark2);
    outline: none;
    border: none;
    color: var(--text2);
    padding: 8px;
    width: 100%;
    cursor: pointer;
    transition: all var(--animation-speed) ease-in-out;
    border-radius: var(--border-radius);
    text-align: center;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    text-transform: capitalize;
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
    `}
`;

export const ChartContainer = styled.div<{ fullScreen: boolean }>`
    ${({ fullScreen }) =>
        fullScreen
            ? `
        transition: all var(--animation-speed) ease-in-out;
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
        overflow: auto;

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
