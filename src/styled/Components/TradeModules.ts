import styled from 'styled-components';
import { FlexContainer } from '../Common';

export const SelectorContainer = styled(FlexContainer)`
    border-radius: var(--border-radius);
    margin-bottom: 16px;

    & a {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;

        border-radius: var(--border-radius);
        font-style: normal;
        font-weight: 300;
        font-size: 18px;
        line-height: 22px;
        letter-spacing: -0.02em;
        color: var(--text1);

        transition: all var(--animation-speed) ease-in-out;
    }

    & a[class='active'],
    & a:hover {
        background: var(--accent1);
        color: var(--text1);
    }
`;

export const SelectorWrapper = styled.div`
    color: var(--text1);
    width: 116.67px;
    height: 25px;
    background: var(--dark2);

    border-radius: var(--border-radius);
`;
