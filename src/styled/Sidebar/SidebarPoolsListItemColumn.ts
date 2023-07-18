import styled from 'styled-components';
import { BodyText } from '..';

const SidebarPoolsListItemColumn = styled.div`
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    font-weight: 300;
    ${BodyText}
    color: var(--text2);
    padding: 5px;
    max-height: 25px;
    overflow: hidden;
    white-space: nowrap;
    border-radius: var(--border-radius);
    cursor: pointer;

    &:hover {
        transition: all var(--animation-speed) ease-in-out;
        background: var(--dark2);
    }
`;

export default SidebarPoolsListItemColumn;
