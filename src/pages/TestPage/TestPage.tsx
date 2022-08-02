// import { useState } from 'react';
// import TooltipComponent from '../../components/Global/TooltipComponent/TooltipComponent';
// import PoolCard from '../../components/Global/PoolCard/PoolCard';
// import Stats from '../../components/Home/Stats/AmbientStats';
// import Carousel from '../../components/Global/Carousel/Carousel';
// import CarouselItem from '../../components/Global/Carousel/CarouselItem/CarouselItem';
// import Landing2 from '../../components/Home/Landing/Landing2';
// import Landing from '../../components/Home/Landing/Landing';
// import Landing3 from '../../components/Home/Landing/Landing3';
// import Landing4 from '../../components/Home/Landing/Landing4';
// import Landing5 from '../../components/Home/Landing/Landing5';
// import Landing6 from '../../components/Home/Landing/Landing6';
// import PositionCard from '../../components/Global/Position/PositionCard';
// import { TokenListIF } from '../../utils/interfaces/exports';
import styles from './TestPage.module.css';

// import Range from '../../components/Global/Account/Range/Range';
// import Transaction from '../../components/Transaction/Transaction';
// import Transactions from '../../components/Global/Transactions/Transactions';

// import Range from '../../components/Global/Account/AccountTabs/Range/Range';
// import Reposition from '../Trade/Reposition/Reposition';
// import WaveAnimation from '../../components/Global/LoadingAnimations/WaveAnimation/WaveAnimation';
// import BouncingBall from '../../components/Global/LoadingAnimations/DotJump/BouncingBall';
// import CircleLoader from '../../components/Global/LoadingAnimations/CircleLoader/CircleLoader';
// import RollingBall from '../../components/Global/LoadingAnimations/RollingBall/RollingBall';

export default function TestPage() {
    // // get the user object from local storage
    // const userData = JSON.parse(localStorage.getItem('user') as string);

    // // initialize local state with an array of active lists from local storage
    // const [activeLists, setActiveLists] = useState(userData.activeTokenLists);

    // console.log({ activeLists });

    // // click handler for toggle button on each token list <li>
    // const toggleList = (list: string) => {
    //     // check if toggled list is currently in the active list
    //     const newActiveTokenList = userData.activeTokenLists.includes(list)
    //         ? // if URI is in active list, remove it
    //           userData.activeTokenLists.filter((uri: string) => uri !== list)
    //         : // if URI is not in active list, add it
    //           [...userData.activeTokenLists, list];
    //     // overwrite the old activeTokenLists value with the new one
    //     userData.activeTokenLists = newActiveTokenList;
    //     // send the updated user object to local storage
    //     localStorage.setItem('user', JSON.stringify(userData));
    //     setActiveLists(newActiveTokenList);
    // };

    // TODO:  @Junior I used a <button> element below for simplicity, I assume that you
    // TODO:  ... will replace it with your toggle component which is fine by me, I also
    // TODO:  ... assume you'll take out the Active vs Not Active `<h6>` as the toggle
    // TODO:  ... will be indicative of this

    // get allTokenLists value from local storage
    // const tokenListElements = JSON.parse(localStorage.getItem('allTokenLists') as string)
    //     // map over the array and make a bank of <li> for the DOM
    //     .map((list: TokenListIF) => (
    //         <li key={`token-list-toggle-${list.uri}`} className={styles.token_list_li}>
    //             <h4>{list.name}</h4>
    //             <h6>{activeLists.includes(list.uri) ? 'Active' : 'Not Active'}</h6>
    //             <button onClick={() => toggleList(list.uri as string)}>Toggle</button>
    //         </li>
    //     ));

    return (
        // <main>

        <main className={styles.container}>
            {/* <ul className={styles.token_list_selects_ul}>{tokenListElements}</ul> */}
            {/* <PositionHeader /> */}
            {/* <LimitOrderHeader />
                {mapItems.map((item, idx) => (
                    <LimitOrderCard key={idx} />
                ))} */}
            {/* <RangeCardHeader /> */}
            {/* <RangeCard /> */}

            {/* <Range /> */}
            {/* <Order />
                
                <TransactionsTable /> */}

            {/* <TableMenu tableType='orders' /> */}

            {/* <Order2 /> */}
            <div style={{ maxWidth: '600px' }} className={styles.loading_screens}>
                {/* <h4>&lt;WaveAnimation ballsAmount=&#123;10&#125; shape=&#39;line&#39; /&gt;</h4>
                    <div className={styles.animation_container}>
                        <WaveAnimation ballsAmount={10} shape='line' />
                    </div>
                    <h4>
                        &lt;WaveAnimation ballsAmount=&#123;10&#125; shape=&#39;square&#39; /&gt;
                    </h4>

                    <div className={styles.animation_container}>
                        <WaveAnimation ballsAmount={10} shape='square' />
                    </div>
                    <h4>
                        &lt;WaveAnimation ballsAmount=&#123;10&#125; shape=&#39;circle&#39; /&gt;
                    </h4>

                    <div className={styles.animation_container}>
                        <WaveAnimation ballsAmount={10} shape='circle' />
                    </div>
                </div>
       
                <h4>&lt;CircleLoader /&gt;</h4>

                <div className={styles.animation_container}>
                    <CircleLoader />
                </div>
                <h4>&lt;BouncingBall /&gt;</h4>
                <div className={styles.animation_container}>
                    <BouncingBall />
                </div>

                <h4>&lt;RollingBall ballSize=&#39;10px&#39; /&gt;</h4>
                <div className={styles.animation_container}>
                    <RollingBall ballSize='30px' />
                </div> */}
                {/* <TabComponent data={allIngredients} /> */}
            </div>
        </main>
    );
}
