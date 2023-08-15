import styled from 'styled-components';

const SidebarPoolsListItemsContainer = styled.div`
    background-repeat: no-repeat;
    background-attachment: local, local, scroll, scroll;
    background-size: 100% 81px, 100% 81px, 100% 27px, 100% 27px;

    overflow-y: auto;
    overflow-x: hidden;
    transition: all var(--animation-speed)
        cubic-bezier(0.175, 0.885, 0.32, 1.275);

    &::-webkit-scrollbar {
        display: none;
    }
`;

export default SidebarPoolsListItemsContainer;
