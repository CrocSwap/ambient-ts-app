// import { useContext } from 'react';
// import { BrandContext } from '../../contexts/BrandContext';

import SepoliaCarousel from '../../components/Home/Landing/SepoliaCarousel';

export default function TestPage() {
    // const { skin } = useContext(BrandContext);

    return (
        <div>
            <SepoliaCarousel />
            {/* <button onClick={() => skin.changeTo('purple_dark')}>
                Purple Dark
            </button>
            <button onClick={() => skin.changeTo('orange_dark')}>
                Orange Dark
            </button> */}
        </div>
    );
}
