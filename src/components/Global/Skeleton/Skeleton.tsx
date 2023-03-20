import './Skeleton.css';
interface SkeltonProps {
    circle: boolean;
}
export default function Skeleton(props: SkeltonProps) {
    return (
        <div className={`skeleton-wrapper${props.circle ? ' skeleton-wrapper-circle' : ''}`}>
            <div className='skeleton'>
                <div className='skeleton-indicator' />
            </div>
            export
        </div>
    );
}
