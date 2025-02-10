import styled from 'styled-components';

interface ScrollContainerProps {
    scrollHeight?: string;
}
export const ScrollContainer = styled.div<ScrollContainerProps>`
    overflow-y: auto;
    ${({ scrollHeight }) =>
        scrollHeight ? `height: ${scrollHeight};` : 'height: 100%'};

    /* Custom scrollbar styles */
    scrollbar-width: thin;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-thumb {
        background: linear-gradient(
            90deg,
            rgba(115, 113, 252, 0) 0%,
            rgba(115, 113, 252, 0) 71.21%,
            var(--accent1) 100%
        );
        border: 1px solid var(--accent1);
        border-radius: var(--border-radius);
    }

    &::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(
            90deg,
            rgba(115, 113, 252, 0) 0%,
            rgba(115, 113, 252, 0) 71.21%,
            var(--accent) 100%
        );
    }
`;
