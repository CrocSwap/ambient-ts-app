import styled from 'styled-components';

const ChartTooltipDiv = styled.div`
    justify-content: space-between;
    text-wrap: wrap;
    align-items: center;
    position: absolute;
    p {
        margin-left: 2px;
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
    flex-direction: column;
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
