import Divider from '../Divider/Divider';
import styles from './Chart.module.css';
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface DataPoint {
    name: string;
    timeRemaining: number;
    price: number;
}
// TODO: CHANGE .CONTENT TO OVERFLOW SCROLL IN CSS WHEN CHART IS IMPLEMENTED(LINE 24)
export default function Chart() {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [selectedDot, setSelectedDot] = useState<string | null>(null);
    const [hoveredDot, setHoveredDot] = useState<string | null>(null);

    const axisColor = '#939C9E'; // text2
    const textColor = '#939C9E'; // text2
    const dotGridColor = '#29585D'; // accent3
    const fillColor = '#0D0F13'; // dark1
    const accentColor = '#62EBF1'; // accent1

    const data: DataPoint[] = [
        { name: 'DOGE', timeRemaining: 40, price: 67316 },
        { name: 'PEPE', timeRemaining: 900, price: 34466 },
        { name: 'BODEN', timeRemaining: 1260, price: 27573 },
        { name: 'APU', timeRemaining: 420, price: 979579 },
        { name: 'BOME', timeRemaining: 40, price: 626930 },
        { name: 'USA', timeRemaining: 300, price: 11294 },
        { name: 'BITCOIN', timeRemaining: 60, price: 17647 },
        { name: 'WIF', timeRemaining: 600, price: 5782 },
        { name: 'TRUMP', timeRemaining: 420, price: 22058 },
        { name: 'DEGEN', timeRemaining: 300, price: 5782 },
        { name: 'LOCKIN', timeRemaining: 5, price: 27573 },
    ];

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const width = 950;
        const height = 292;
        const margin = { top: 20, right: 0, bottom: 40, left: 40 };

        // clear previous content
        svg.selectAll('*').remove();

        // calculate max y value rounded up to the next 100k
        const maxPrice = d3.max(data, (d) => d.price);
        const maxYValue =
            maxPrice !== undefined
                ? Math.ceil(maxPrice / 100000) * 100000
                : 100000;

        // add buffer of 1 hour to both ends of the x-axis
        const minXValue = -60;
        const maxXValue = 1440 + 60;

        // set up scales
        const xScale = d3
            .scaleLinear()
            .domain([maxXValue, minXValue]) // Reversed scale with a buffer
            .range([margin.left, width - margin.right]);

        const yScale = d3
            .scaleLinear()
            .domain([-50000, maxYValue]) // Extend y-axis 100k past highest price and add buffer
            .range([height - margin.bottom, margin.top]);

        // create axes
        const xAxis = d3
            .axisBottom(xScale)
            .tickValues(d3.range(0, 1441, 60)) // Set tick values to every hour (60 minutes)
            .tickFormat((d: d3.NumberValue) => {
                const hour = d.valueOf() / 60; // Convert tick value from minutes to hours
                return hour.toString(); // Return the hour value directly
            });

        const yAxis = d3
            .axisLeft(yScale)
            .tickValues(d3.range(0, maxYValue + 100000, 100000)) // Set tick values to every 100k
            .tickFormat(
                (d: d3.NumberValue) => `${(d.valueOf() / 1000).toFixed(0)}k`,
            ); // Format y axis labels as XXk

        const xAxisGroup = svg
            .append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(xAxis);

        const yAxisGroup = svg
            .append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(yAxis);

        // style the axes
        xAxisGroup.selectAll('path, line').attr('stroke', axisColor);
        xAxisGroup
            .selectAll('text')
            .attr('fill', textColor)
            .style('font-family', 'Roboto Mono');

        yAxisGroup.selectAll('path, line').attr('stroke', axisColor);
        yAxisGroup
            .selectAll('text')
            .attr('fill', textColor)
            .style('font-family', 'Roboto Mono');

        // create dot grid
        const xTicks = d3.range(0, 1441, 60).map(xScale);
        const yTicks = d3.range(0, maxYValue + 100000, 100000).map(yScale);

        xTicks.forEach((x) => {
            yTicks.forEach((y) => {
                svg.append('circle')
                    .attr('cx', x)
                    .attr('cy', y)
                    .attr('r', 1)
                    .attr('fill', dotGridColor);
            });
        });

        // create circles
        svg.selectAll('circle.data-point')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'data-point')
            .attr('cx', (d) => xScale(d.timeRemaining))
            .attr('cy', (d) => yScale(d.price))
            .attr('r', (d) => (selectedDot === d.name ? 12 : 8)) // Larger size for selected dot
            .attr('fill', (d) =>
                selectedDot === d.name ? accentColor : fillColor,
            ) // Fill color for selected dot
            .attr('stroke', accentColor) // Stroke color
            .attr('stroke-width', 2)
            .on('click', function (event, d) {
                setSelectedDot(d.name === selectedDot ? null : d.name);
            })
            .on('mouseover', function (event, d) {
                setHoveredDot(d.name);
                if (d.name !== selectedDot) {
                    d3.select(this)
                        .transition()
                        .duration(200) // Transition duration for hover effect
                        .attr('fill', accentColor);
                }
            })
            .on('mouseout', function (event, d) {
                setHoveredDot(null);
                if (d.name !== selectedDot) {
                    d3.select(this)
                        .transition()
                        .duration(200) // Transition duration for hover effect
                        .attr('fill', fillColor);
                }
            });
    }, [data, selectedDot, hoveredDot]);

    const displayData = hoveredDot
        ? data.find((d) => d.name === hoveredDot)
        : selectedDot
          ? data.find((d) => d.name === selectedDot)
          : { name: '-', timeRemaining: '-', price: '-' };

    const formatTime = (time: number | string): string => {
        if (time === '-') return '-';
        return typeof time === 'number' && time >= 60
            ? `${Math.floor(time / 60)}h`
            : `${time}m`;
    };

    const formatPrice = (price: number | string): string => {
        if (price === '-') return '-';
        return typeof price === 'number' ? `$${price.toLocaleString()}` : price;
    };
    return (
        <div className={styles.container}>
            <Divider count={2} />
            <div className={styles.chartHeader}>
                <h3>CHART</h3>
            </div>
            <div className={styles.content}>
                <svg ref={svgRef} width='950' height='292'></svg>
                <div
                    style={{
                        width: '150px',
                        marginLeft: '0px',
                        fontFamily: 'Roboto Mono',
                        color: textColor,
                        fontSize: '12px',
                    }}
                >
                    <p style={{ textAlign: 'left', margin: '2px 0' }}>
                        TICKER:{' '}
                        <span style={{ float: 'right', marginLeft: '10px' }}>
                            {displayData?.name}
                        </span>
                    </p>
                    <p style={{ textAlign: 'left', margin: '2px 0' }}>
                        TIME REMAINING:{' '}
                        <span style={{ float: 'right', marginLeft: '10px' }}>
                            {formatTime(displayData?.timeRemaining ?? '-')}
                        </span>
                    </p>
                    <p style={{ textAlign: 'left', margin: '2px 0' }}>
                        MARKET CAP:{' '}
                        <span style={{ float: 'right', marginLeft: '10px' }}>
                            {formatPrice(displayData?.price ?? '-')}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
