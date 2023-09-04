import styled from 'styled-components';
import backgroundImage from '../../../assets/images/backgrounds/tableInfoBg.png';

// can be extracted to common

const MainSection = styled.section`
    background: url(${backgroundImage}) no-repeat;

    height: 100%;
    padding: 8px;
`;

const BoxContainer = styled.div`
    grid-column: span 1;
    background: rgba(23, 29, 39, 0.4);
    backdrop-filter: blur(10px);
    border-radius: 0.25rem;
    height: 100%;
`;

const FeaturedBoxInnerContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 1rem;
`;

const InfoHeader = styled.div`
    color: var(--text2);
    font-size: var(--body-size);
    line-height: var(--body-lh);
    font-weight: 400;
`;

const FlexCenter = styled.div`
    display: flex;
    align-items: center;
`;

const FeaturedBoxInfoContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;
const TokenSymbol = styled.p`
    margin-left: 0.5rem;
    color: var(--header2-size);
    font-weight: 400;
`;

const TokenName = styled.p`
    margin-left: 0.5rem;
    font-size: var(--body-size);
    color: var(--text2);
    font-weight: 400;
`;

const BoxInfoText = styled.p`
    color: var(--header2-size);
    font-weight: 400;

    color: var(--text1);
`;

const LinkText = styled.a`
    margin-left: 0.5rem;
    font-size: var(--body-size);
    color: var(--accent1);
    font-weight: 400;
`;

const DetailedBoxContainer = styled.div`
    display: flex;
    padding: 8px;

    flex-direction: column;
    gap: 0.5rem;
`;

const TabPlaceholder = styled.div`
    grid-column: span 1;
    height: 100%;
    background: rgba(23, 29, 39, 0.4);
    backdrop-filter: blur(10px);
`;
const StyledTabContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;

    justify-content: center;
    align-items: center;
    font-size: var(--body-size);
    line-height: var(--body-lh);
    font-weight: 400;

    p:first-child {
        color: var(--text2);
    }

    p:nth-child(2) {
        color: var(--text1);
    }
`;

export {
    MainSection,
    BoxContainer,
    FeaturedBoxInfoContainer,
    InfoHeader,
    FeaturedBoxInnerContainer,
    FlexCenter,
    TokenName,
    TokenSymbol,
    BoxInfoText,
    LinkText,
    TabPlaceholder,
    DetailedBoxContainer,
    StyledTabContainer,
};
