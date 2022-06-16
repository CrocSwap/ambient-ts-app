import Landing from './Landing';
import Landing2 from './Landing2';
import Landing3 from './Landing3';
import Landing4 from './Landing4';
import Landing5 from './Landing5';
import Landing6 from './Landing6';
import CarouselItem from '../../Global/Carousel/CarouselItem/CarouselItem';
import Carousel from '../../Global/Carousel/Carousel';

export default function Slides() {
    return (
        <div>
            <Carousel>
                <CarouselItem>
                    <Landing />
                </CarouselItem>
                <CarouselItem>
                    <Landing2 />
                </CarouselItem>
                <CarouselItem>
                    <Landing3 />
                </CarouselItem>
                <CarouselItem>
                    <Landing4 />
                </CarouselItem>
                <CarouselItem>
                    <Landing5 />
                </CarouselItem>
                <CarouselItem>
                    <Landing6 />
                </CarouselItem>
            </Carousel>
        </div>
    );
}
