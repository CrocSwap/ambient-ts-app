// StyledSections.tsx
import styled from 'styled-components';

export const SlideContainer = styled.div<{
    tabletHeight: 'large' | 'medium' | 'small';
}>`
    padding-bottom: 1rem;

    @media only screen and (min-width: 768px) {
        padding-bottom: 0;
        padding: 2rem 0;
        justify-content: center;
        align-items: center;
        display: flex;
        ${({ tabletHeight }) => {
            switch (tabletHeight) {
                case 'large':
                    return 'min-height: 500px;';
                case 'medium':
                    return 'height: 400px;';
                case 'small':
                default:
                    return 'height: 300px;';
            }
        }}

    @media only screen and (max-width: 600px) {
        h2 {
            font-size: 20px;
        }
        a {
            display: none;
        }
    }
`;

export const HeightMedium = styled.div`
    height: 400px;
`;
export const Home2 = styled.div`
    height: 500px;
`;

export const RowContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;

    @media only screen and (min-width: 768px) {
        flex-direction: row;
    }
`;

export const FasterSection = styled.section`
    max-width: 907px;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
    text-align: center;

    h1 {
        font-family: var(--font-logo);
        color: var(--text1);
        font-weight: 300;
        font-size: 34px;
        line-height: 50px;
        text-align: center;

        @media only screen and (min-width: 768px) {
            text-align: start;
        }
    }

    h2 {
        font-family: var(--font-logo);
        color: var(--text1);
        font-weight: 300;
        font-size: 30px;
        line-height: 38px;
    }

    p {
        font-weight: 300;
        font-size: 18px;
        line-height: 22px;
        color: var(--text1);
    }
`;

export const BGImage = styled.img<{ height: number; top: number }>`
    position: absolute;
    width: 100%;
    height: ${({ height }) => height}px;
    top: ${({ top }) => top}px;

    @media only screen and (max-width: 600px) {
        display: none;
    }
`;
