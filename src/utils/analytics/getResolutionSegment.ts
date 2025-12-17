export const getResolutionSegment = (resolution: number) => {
    const resolutionSegment =
        resolution < 100
            ? '< 100px'
            : resolution < 200
              ? '< 200px'
              : resolution < 300
                ? '< 300px'
                : resolution < 400
                  ? '< 400px'
                  : resolution < 500
                    ? '< 500px'
                    : resolution < 600
                      ? '< 600px'
                      : resolution < 700
                        ? '< 700px'
                        : resolution < 800
                          ? '< 800px'
                          : resolution < 900
                            ? '< 900px'
                            : resolution < 1000
                              ? '< 1000px'
                              : resolution < 1100
                                ? '< 1100px'
                                : resolution < 1200
                                  ? '< 1200px'
                                  : resolution < 1300
                                    ? '< 1300px'
                                    : resolution < 1400
                                      ? '< 1400px'
                                      : resolution < 1500
                                        ? '< 1500px'
                                        : resolution < 1600
                                          ? '< 1600px'
                                          : resolution < 1700
                                            ? '< 1700px'
                                            : resolution < 1800
                                              ? '< 1800px'
                                              : resolution < 1900
                                                ? '< 1900px'
                                                : resolution < 2000
                                                  ? '< 2000px'
                                                  : resolution < 2500
                                                    ? '< 2500px'
                                                    : resolution < 3000
                                                      ? '< 3000px'
                                                      : resolution < 4000
                                                        ? '< 4000px'
                                                        : resolution < 5000
                                                          ? '< 5000px'
                                                          : resolution < 6000
                                                            ? '< 6000px'
                                                            : resolution < 7000
                                                              ? '< 7000px'
                                                              : resolution <
                                                                  8000
                                                                ? '< 8000px'
                                                                : resolution <
                                                                    9000
                                                                  ? '< 9000px'
                                                                  : resolution <
                                                                      10000
                                                                    ? '< 10000px'
                                                                    : resolution >=
                                                                        10000
                                                                      ? '>= 10000px'
                                                                      : 'unknown';
    return resolutionSegment;
};
