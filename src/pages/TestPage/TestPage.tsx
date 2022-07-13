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
import PositionHeader from '../../components/Global/Position/PositionHeader';
import LimitOrderHeader from '../../components/Global/LimitOrder/LimitOrderHeader';
// import { TokenListIF } from '../../utils/interfaces/exports';
import styles from './TestPage.module.css';
import LimitOrderCard from '../../components/Global/LimitOrder/LimitOrderCard';

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

    const mapItems = [1, 2, 4, 4, 5, 6, 7, 8, 9];

    return (
        // <main>
        //     <button onClick={() => setOpenSnackbar(true)}>open me</button>
        //     <h3>This is TestPage.tsx</h3>
        //     <SnackbarComponent
        //         severity='success'
        //         setOpenSnackbar={setOpenSnackbar}
        //         openSnackbar={openSnackbar}
        //     >
        //         I am snackbar
        //     </SnackbarComponent>
        //     <TooltipComponent title='Snackbar title' />
        //     <PoolCard />
        //     <Stats />
        //     <Carousel>
        //         <CarouselItem>
        //             <Landing />
        //         </CarouselItem>
        //         <CarouselItem>
        //             <Landing2 />
        //         </CarouselItem>
        //         <CarouselItem>
        //             <Landing3 />
        //         </CarouselItem>
        //         <CarouselItem>
        //             <Landing4 />
        //         </CarouselItem>
        //         <CarouselItem>
        //             <Landing5 />
        //         </CarouselItem>
        //         <CarouselItem>
        //             <Landing6 />
        //         </CarouselItem>
        //     </Carousel>
        //     </main>
        <>
            <main className={styles.container}>
                {/* <ul className={styles.token_list_selects_ul}>{tokenListElements}</ul> */}
                {/* <PositionHeader /> */}
                <LimitOrderHeader />
                {mapItems.map((item, idx) => (
                    <LimitOrderCard key={idx} />
                ))}
            </main>
        </>
    );
}
