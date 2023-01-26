import styles from './HomeSlider.module.css';
import { SwiperSlide, Swiper } from 'swiper/react';
import 'swiper/swiper.min.css';
import 'swiper/modules/pagination/pagination.min.css';
import { Navigation, EffectFade, Autoplay, Pagination } from 'swiper';
import Landing1 from './Landing1';
// import Landing2 from './Landing2';
// import Landing3 from './Landing3';
// import Landing4 from './Landing4';
// import Landing5 from './Landing5';
// import Landing6 from './Landing6';
// import Landing from './Landing';
// import 'swiper/css/effect-fade'
// import 'swiper/css/navigation'
export default function HomeSlider() {
    return (
        <div className={styles.container}>
            <Swiper
                modules={[Navigation, EffectFade, Autoplay, Pagination]}
                // touchStartPreventDefault={false}
                noSwipingSelector={'button'}
                navigation
                speed={800}
                // autoplay={{
                //     delay: 30000,
                //     disableOnInteraction: true,
                // }}
                autoplay={false}
                slidesPerView={1}
                loop
                pagination={{ clickable: true }}
                className={styles.myswiper}
                allowTouchMove={false}
            >
                {/* <SwiperSlide className={styles.swiperslide} style={{ background: 'url()' }}>
                    <Landing />
                </SwiperSlide> */}
                <SwiperSlide className={styles.swiperslide} style={{ background: 'url()' }}>
                    <Landing1 />
                </SwiperSlide>
                {/* <SwiperSlide className={styles.swiperslide}>
                    <Landing2 />
                </SwiperSlide>
                <SwiperSlide className={styles.swiperslide}>
                    <Landing3 />
                </SwiperSlide>
                <SwiperSlide className={styles.swiperslide}>
                    <Landing4 />
                </SwiperSlide>
                <SwiperSlide className={styles.swiperslide}>
                    <Landing5 />
                </SwiperSlide>
                <SwiperSlide className={styles.swiperslide}>
                    <Landing6 />
                </SwiperSlide> */}
            </Swiper>
        </div>
    );
}
