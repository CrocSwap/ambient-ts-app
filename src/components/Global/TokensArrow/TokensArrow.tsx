import styles from './TokensArrow.module.css';
// import { useState } from 'react';
export default function TokensArrow() {
    // const [rotateChevron, setRotateChevron] = useState(false);
    // const handleRotate = () => setRotateChevron(!rotateChevron);
    // const rotate = rotateChevron ? 'rotate(180deg)' : 'rotate(0)';

    // const arrowLeft = (
    //     <div className={styles.arrow_left}>
    //         <svg
    //             width='16'
    //             height='10'
    //             viewBox='0 0 24 15'
    //             fill='none'
    //             xmlns='http://www.w3.org/2000/svg'
    //             className={styles.token_arrow}
    //         >
    //             <path
    //                 d='M2.82 0.000312805L12 9.16031L21.18 0.000312805L24 2.82031L12 14.8203L0 2.82031L2.82 0.000312805Z'
    //                 fill='url(#paint0_linear_666_33965)'
    //             />
    //             <defs>
    //                 <linearGradient
    //                     id='paint0_linear_666_33965'
    //                     x1='0'
    //                     y1='7.41031'
    //                     x2='24'
    //                     y2='7.41031'
    //                     gradientUnits='userSpaceOnUse'
    //                 >
    //                     <stop stopColor='#7371FC' />
    //                     <stop offset='0.494792' stopColor='#CDC1FF' />
    //                     <stop offset='1' stopColor='#7371FC' />
    //                 </linearGradient>
    //             </defs>
    //         </svg>
    //     </div>
    // );
    // const arrowRight = (
    //     <div className={styles.arrow_right}>
    //         <svg
    //             width='16'
    //             height='10'
    //             viewBox='0 0 24 15'
    //             fill='none'
    //             xmlns='http://www.w3.org/2000/svg'
    //             className={styles.token_arrow}
    //         >
    //             <path
    //                 d='M2.82 0.000312805L12 9.16031L21.18 0.000312805L24 2.82031L12 14.8203L0 2.82031L2.82 0.000312805Z'
    //                 fill='url(#paint0_linear_666_33965)'
    //             />
    //             <defs>
    //                 <linearGradient
    //                     id='paint0_linear_666_33965'
    //                     x1='0'
    //                     y1='7.41031'
    //                     x2='24'
    //                     y2='7.41031'
    //                     gradientUnits='userSpaceOnUse'
    //                 >
    //                     <stop stopColor='#7371FC' />
    //                     <stop offset='0.494792' stopColor='#CDC1FF' />
    //                     <stop offset='1' stopColor='#7371FC' />
    //                 </linearGradient>
    //             </defs>
    //         </svg>
    //     </div>
    // );

    // const rotateSvgs = (
    //     <>
    //         <svg xmlns='http://www.w3.org/2000/svg' viewBox='3 0 19 19'>
    //             <defs>
    //                 <linearGradient id='grad' x1='0%' y1='0%' x2='0%' y2='100%'>
    //                     <stop offset='0%' stopColor='#CDC1FF' />
    //                     <stop offset='100%' stopColor='#7371FC' />
    //                 </linearGradient>
    //             </defs>
    //             <path d='M12 5l-7 7h4v7h6v-7h4z' fill='url(#grad)' strokeWidth='1.5' />
    //         </svg>

    //         <svg xmlns='http://www.w3.org/2000/svg' viewBox='1 2 19 19'>
    //             <defs>
    //                 <linearGradient id='grad' x1='0%' y1='0%' x2='0%' y2='100%'>
    //                     <stop offset='0%' stopColor='#CDC1FF' />
    //                     <stop offset='100%' stopColor='#7371FC' />
    //                 </linearGradient>
    //             </defs>
    //             <path d='M8 5l-7 7h4v7h6v-7h4z' fill='url(#grad)' strokeWidth='1.5' />
    //         </svg>
    //     </>
    // );

    return (
        <div
            className={styles.container}
            // style={{ transform: rotate, transition: 'all 0.2s linear' }}
            // onClick={handleRotate}
        >
            <svg
                width='24'
                height='15'
                viewBox='0 0 24 15'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className={styles.token_arrow}
            >
                <path
                    d='M2.82 0.000312805L12 9.16031L21.18 0.000312805L24 2.82031L12 14.8203L0 2.82031L2.82 0.000312805Z'
                    fill='url(#paint0_linear_666_33965)'
                />
                <defs>
                    <linearGradient
                        id='paint0_linear_666_33965'
                        x1='0'
                        y1='7.41031'
                        x2='24'
                        y2='7.41031'
                        gradientUnits='userSpaceOnUse'
                    >
                        <stop stopColor='#7371FC' />
                        <stop offset='0.494792' stopColor='#7371FC' />
                        <stop offset='1' stopColor='#7371FC' />
                    </linearGradient>
                </defs>
            </svg>

            {/* {rotateSvgs} */}
        </div>
    );
}
