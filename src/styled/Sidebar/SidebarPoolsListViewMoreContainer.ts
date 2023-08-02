import styled from 'styled-components';
import { BodyText } from '..';

const SidebarPoolsListViewMoreContainer = styled.div`
    display: flex;
    justify-content: center;
    ${BodyText}
    color: var(--accent4);
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;

    &:hover {
        color: var(--accent1);
        transition: all var(--animation-speed) ease-in-out;
    }
`;

export default SidebarPoolsListViewMoreContainer;
