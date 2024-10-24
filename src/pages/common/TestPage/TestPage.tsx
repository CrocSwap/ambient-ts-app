// import { useContext } from 'react';
// import { BrandContext } from '../../contexts/BrandContext';

import { useState } from 'react';
import SwipeableTabs from '../../TestPage/SwipeableTabs';
import HexReveal from '../../platformFuta/Home/Animations/HexReveal';
import FadingText from '../../platformFuta/Home/Animations/FadingText';
import FadingTextGrid from '../../platformFuta/Home/Animations/FadingTextGrid';
import { FlexContainer } from '../../../styled/Common';
import FutaLanding2 from '../../platformFuta/Home/FutaLandings/NewLandings/FutaLanding2';
import FutaLandingNav from '../../platformFuta/Home/FutaLandings/FutaLandingNav';
import FutaNewLanding from '../../platformFuta/Home/FutaLandings/NewLandings/FutaNewLanding';



export default function TestPage() {
    const [activeTab, setActiveTab] = useState(0);

    const tabData = [
      { label: 'Trade', content: <div>Content for Trade</div> },
      { label: 'Explore', content: <div>Content for Explore</div> },
      { label: 'Account', content: <div>Content for Account</div> },
      { label: 'Chat', content: <div>Content for Chat</div> },
    ];
  
    return (
      // <FlexContainer justifyContent='center' alignItems='center' style={{width: '100vw', height: '100vh'}}>

      //   <FadingTextGrid/>
      // </FlexContainer>
    
      <FutaNewLanding/>
      // <FutaLandingNav/>
    );
  };
