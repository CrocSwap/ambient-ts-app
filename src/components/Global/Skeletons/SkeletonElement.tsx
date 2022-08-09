import './SkeletonElement.css';

interface SkeletonElementProps {
    type: string;
}
export default function SkeletonElement(props: SkeletonElementProps) {
    const classes = `skeleton ${props.type}`;
    return <div className={classes}></div>;
}
