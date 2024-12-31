import styled from 'styled-components';

const ChartTooltipDiv = styled.div<{
    isToolbarOpen: boolean;
    isFullScreen: boolean;
    isFuta: boolean;
}>`
    justify-content: space-between;
    text-wrap: wrap;
    align-items: center;
    position: fixed;

    margin-top: -15px;
    margin-left: ${({ isFuta }) => (isFuta ? '7px' : '10px')};

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
        margin-left: ${({ isToolbarOpen, isFuta }) =>
            isFuta
                ? isToolbarOpen
                    ? '38px'
                    : '12px'
                : isToolbarOpen
                  ? '52px'
                  : '22px'};

        p {
            margin-left: 5px;
            max-width: 1000px;
        }
    }
`;

const CurrentDataDiv = styled.div<{
    isFuta: boolean;
}>`
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
    margin-top: 0px;

    @media screen and (min-width: 768px) {
        font-size: var(--body-size);
        flex-direction: row;
        margin-top: 5px;
    }
`;

export { ChartTooltipDiv, CurrentDataDiv };
