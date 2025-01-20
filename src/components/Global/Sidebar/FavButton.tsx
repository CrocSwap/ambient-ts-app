import { HeaderButtons } from '../../../styled/Components/Chart';
import { useMediaQuery } from '../../../utils/hooks/useMediaQuery';

interface propsIF {
    isButtonFavorited: boolean;
    handleFavButton: () => void;
}

export default function FavButton(props: propsIF) {
    const { isButtonFavorited, handleFavButton } = props;
    const smallScrenView = useMediaQuery('(max-width: 968px)');

    return (
        <HeaderButtons
            onClick={handleFavButton}
            id='trade_fav_button'
            role='button'
            tabIndex={0}
            aria-label={
                isButtonFavorited
                    ? ' Remove pool from favorites'
                    : 'Add pool from favorites'
            }
        >
            {
                <svg
                    width={smallScrenView ? '18px' : '24px'}
                    height={smallScrenView ? '18px' : '24px'}
                    viewBox='0 0 15 15'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                >
                    <g clipPath='url(#clip0_1874_47746)'>
                        <path
                            d='M12.8308 3.34315C12.5303 3.04162 12.1732 2.80237 11.7801 2.63912C11.3869 2.47588 10.9654 2.39185 10.5397 2.39185C10.1141 2.39185 9.69255 2.47588 9.29941 2.63912C8.90626 2.80237 8.54921 3.04162 8.24873 3.34315L7.78753 3.81033L7.32633 3.34315C7.02584 3.04162 6.66879 2.80237 6.27565 2.63912C5.8825 2.47588 5.461 2.39185 5.03531 2.39185C4.60962 2.39185 4.18812 2.47588 3.79498 2.63912C3.40183 2.80237 3.04478 3.04162 2.7443 3.34315C1.47451 4.61294 1.39664 6.75721 2.99586 8.38637L7.78753 13.178L12.5792 8.38637C14.1784 6.75721 14.1005 4.61294 12.8308 3.34315Z'
                            fill={isButtonFavorited ? '#EBEBFF' : 'none'}
                            stroke='#EBEBFF'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                    </g>
                    <defs>
                        <clipPath id='clip0_1874_47746'>
                            <rect
                                width='14'
                                height='14'
                                fill='white'
                                transform='translate(0.600098 0.599976)'
                            />
                        </clipPath>
                    </defs>
                </svg>
            }
        </HeaderButtons>
    );
}
