import fogoPresaleSvg from '../../../assets/images/fogoPresale.svg';

export default function FogoPresaleBanner() {
    return (
        <a
            href='http://presale.fogo.io/'
            target='_blank'
            rel='noopener noreferrer'
            style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
            }}
        >
            <img
                src={fogoPresaleSvg}
                alt='Fogo Presale'
                style={{
                    width: '100%',
                    maxHeight: '60px',
                    objectFit: 'contain',
                    display: 'block',
                }}
            />
        </a>
    );
}
