import styled from 'styled-components';

export const HeroContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    border-radius: var(--border-radius);
    background: linear-gradient(
            180deg,
            var(--dark1) 0%,
            var(--dark1) 0%,
            rgba(0, 0, 0, 0) 0%,
            var(--dark1) 100%
        ),
        url('../../../assets/images/home/home_wallpaper.png') no-repeat center
            center;
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover;

    & > div {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 2rem;
    }

    img {
        width: 250px;
        transition: all var(--animation-speed) ease-in-out;
    }

    @media only screen and (min-width: 768px) {
        img {
            width: 500px;
        }
    }
`;
