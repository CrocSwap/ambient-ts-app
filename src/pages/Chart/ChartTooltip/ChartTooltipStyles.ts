import styled from 'styled-components';

const ChartTooltipDiv = styled.div<{
    isToolbarOpen: boolean;
    isFullScreen: boolean;
}>`
    justify-content: space-between;
    text-wrap: wrap;
    align-items: center;
    position: fixed;

    margin-top: -24px;
    margin-left: 10px;

    p {
        margin-left: 0px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        max-width: 380px;
    }
    @media screen and (min-width: 768px) {
        position: absolute;
        margin-top: 0px;
        margin-left: ${({ isToolbarOpen }) =>
            isToolbarOpen ? '38px' : '12px'};

        p {
            margin-left: 2px;
            max-width: 1000px;
        }
    }
`;

const CurrentDataDiv = styled.div`
    font-family: 'Lexend Deca';
    font-style: normal;
    font-weight: 300;
    font-size: var(--mini-size);
    line-height: var(--mini-lh);

    text-wrap: wrap;

    display: flex;
    flex-direction: row;
    align-items: start;

    color: var(--text2);
    min-height: 30px;
    padding-left: 4px;
    margin-top: 5px;

    @media screen and (min-width: 768px) {
        font-size: var(--body-size);
        flex-direction: row;
    }
`;

export { ChartTooltipDiv, CurrentDataDiv };
