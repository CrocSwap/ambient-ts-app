import fogoPresaleSvg from '../../../assets/images/fogoPresale.svg';

export default function FogoPresaleBanner() {
    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <a
                href='http://presale.fogo.io/'
                target='_blank'
                rel='noopener noreferrer'
                style={{
                    display: 'inline-block',
                    cursor: 'pointer',
                }}
            >
                <img
                    src={fogoPresaleSvg}
                    alt='Fogo Presale'
                    style={{
                        height: '50px',
                        width: 'auto',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        display: 'block',
                    }}
                />
            </a>
        </div>
    );
}
