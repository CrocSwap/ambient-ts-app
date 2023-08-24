import styled from 'styled-components';

const SidebarPoolsListViewMoreContainer = styled.div`
    display: flex;
    justify-content: center;
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
