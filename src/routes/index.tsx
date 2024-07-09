import React, { useMemo } from 'react';
import PlatformAmbientRoutes from './PlatformAmbient';
import PlatformFutaRoutes from './PlatformFuta';
// import CommonRoutes from './CommonRoutes';

export const RouteRenderer: React.FC<{ platformName: string }> = ({
    platformName,
}) => {
    const platformRoutes = useMemo(() => {
        if (platformName === 'futa') {
            return <PlatformFutaRoutes />;
        } else return <PlatformAmbientRoutes />;
    }, [platformName]);

    return (
        <>
            {/* <CommonRoutes /> */}
            {platformRoutes}
        </>
    );
};

// export default getRoutes;
