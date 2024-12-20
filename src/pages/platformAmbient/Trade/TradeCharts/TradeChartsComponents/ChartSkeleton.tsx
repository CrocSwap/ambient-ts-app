import styles from './ChartSkeleton.module.css';

interface PropsIF {
    periodToReadableTime: string | undefined;
}
const ChartSkeleton = (props: PropsIF) => {
    const svg = (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='#000000'
            version='1.1'
            id='Capa_1'
            width='800px'
            height='800px'
            viewBox='0 0 410.916 410.915'
            xmlSpace='preserve'
        >
            <g>
                {/* Existing path */}
                <path
                    d='M410.916,375.428v22.415H0V13.072h22.413v362.355H410.916z M89.193,315.652h11.208v-50.431h10.27V145.689h-10.27V93.393   
    H89.193v52.296H78.917v119.533h10.277V315.652z M152.69,241.872h11.207v-51.365h10.276V70.971h-10.276V19.606H152.69v51.365
    h-10.27v119.536h10.27V241.872z M215.727,279.229h11.207v-49.488h10.271V110.194h-10.271V56.963h-11.207v53.231h-10.276V229.73
    h10.276V279.229z M287.169,300.243h11.21v-49.965h10.273V130.742h-10.273V77.976h-11.21v52.767h-10.269v119.536h10.269
    V300.243z M360.484,242.349h11.206v-51.833h10.271V70.971H371.69V20.077h-11.206v50.895h-10.276v119.536h10.276
    V242.349z'
                />

                {/* New circles to add with smaller radius */}
                <circle
                    cx='100'
                    cy='100'
                    r='10' /* Reduced size */
                    stroke='var(--dark3)' /* Example accent color */
                    strokeWidth='2'
                    fill='none'
                    opacity='0.6'
                />
                <circle
                    cx='200'
                    cy='150'
                    r='12' /* Reduced size */
                    stroke='var(--dark3)'
                    strokeWidth='2'
                    fill='none'
                    opacity='0.6'
                />
                <circle
                    cx='300'
                    cy='200'
                    r='8' /* Reduced size */
                    stroke='var(--dark3)'
                    strokeWidth='2'
                    fill='none'
                    opacity='0.6'
                />
                <circle
                    cx='250'
                    cy='250'
                    r='10' /* Reduced size */
                    stroke='var(--dark3)'
                    strokeWidth='2'
                    fill='none'
                    opacity='0.6'
                />
            </g>
        </svg>
    );
    return (
        <section className={`${styles.container} ${styles.shimmerBG}`}>
            <h3 className={styles.loadingText}>
                Loading {props.periodToReadableTime}
                Candle Chart...
            </h3>

            <span className={styles.topBar}></span>

            <div className={styles.content}>
                <div className={styles.leftSide}>
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                </div>

                <div className={`${styles.middleSide} ${styles.shimmerBG}`}>
                    {svg}
                </div>

                <div className={styles.rightSide}>
                    <div className={styles.rightSideItem}>
                        <span />
                    </div>
                    <div className={styles.rightSideItem}>
                        <span />
                    </div>
                    <div className={styles.rightSideItem}>
                        <span />
                    </div>
                    <div className={styles.rightSideItem}>
                        <span />
                    </div>
                    <div className={styles.rightSideItem}>
                        <span />
                    </div>
                    <div className={styles.rightSideItem}>
                        <span />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ChartSkeleton;
