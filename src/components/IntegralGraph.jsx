import React, { useMemo } from 'react';
import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Scatter
} from 'recharts';
import * as math from 'mathjs';
import nerdamer from 'nerdamer';
import { preprocessLatex } from '../utils/numericalIntegration';

const IntegralGraph = ({ func, a, b, n, method }) => {
    // Generate data for the graph
    const data = useMemo(() => {
        try {
            const start = parseFloat(a);
            const end = parseFloat(b);
            const N = parseInt(n);

            if (isNaN(start) || isNaN(end) || isNaN(N)) return [];

            // 1. Prepare function evaluator
            // Convert Latex to MathJS readable format if needed, or rely on simple parsing
            // Assuming func is coming from the clean expression used in calculation
            // But we might need to be careful with latex inputs like \sin(x)
            // 1. Prepare function evaluator
            // Use the centralized robust preprocessor
            const exprString = preprocessLatex(func);

            const node = math.parse(exprString);
            const code = node.compile();

            // 2. Generate Smooth Curve Data (True Function)
            const curvePoints = [];
            const steps = 100; // Resolution
            const range = end - start;
            const stepSize = range / steps;

            // Add margin to view slightly outside [a, b]
            const viewMargin = range * 0.1;
            const viewStart = start - viewMargin;
            const viewEnd = end + viewMargin;
            const totalSteps = 140; // More steps to cover margins
            const totalStepSize = (viewEnd - viewStart) / totalSteps;

            for (let i = 0; i <= totalSteps; i++) {
                const x = viewStart + (i * totalStepSize);
                try {
                    const y = code.evaluate({ x });
                    curvePoints.push({ x, yTrue: y }); // yTrue for the smooth curve
                } catch (e) {
                    // Ignore points outside domain
                }
            }

            // 3. Generate Segment Data (Approximation / Shading)
            // Just calculating the specific points used in the method
            const segmentPoints = [];
            const h = (end - start) / N;

            for (let i = 0; i <= N; i++) {
                const x = start + i * h;
                try {
                    const y = code.evaluate({ x });
                    // For the chart, we want these points to be part of the "Area"
                    // But Recharts requires a unified data array if we want to share X-Axis easily
                    // OR we can make a custom data array for the scatter/area
                    segmentPoints.push({ x, ySegment: y, label: `x${i}` });
                } catch (e) { }
            }

            // 4. Merge Data (Tricky part with Recharts X-Axis)
            // Recharts handles numerical X-axis well if we specify type="number"
            // We can just dump all points into one array, or use separate data props for Line/Area

            return { curvePoints, segmentPoints, debugExpr: exprString };

        } catch (error) {
            console.error("Graph Error:", error);
            return { curvePoints: [], segmentPoints: [], error: error.message };
        }
    }, [func, a, b, n, method]);

    if (data.error) {
        return (
            <div className="card" style={{ padding: '1rem', marginTop: '1rem', border: '1px solid red', color: 'red' }}>
                <strong>Graph Error:</strong> {data.error}<br />
                <small>Input: {func}</small>
            </div>
        );
    }

    if (!data.curvePoints.length) {
        return (
            <div className="card" style={{ padding: '1rem', marginTop: '1rem', border: '1px solid orange' }}>
                Graph could not be generated.<br />
                <small>Input: {func}</small><br />
                <small>Parsed: {data.debugExpr}</small>
            </div>
        );
    }

    // Formatting for tooltip
    const formatNumber = (num) => parseFloat(num).toFixed(4);

    return (
        <div className="graph-container" style={{ width: '100%', height: 'auto', marginTop: '2rem', background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#495057' }}>Visualisasi Grafik</h3>
            <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="x"
                            type="number"
                            domain={['auto', 'auto']}
                            allowDataOverflow={true}
                            tickFormatter={(val) => val.toFixed(2)}
                        />
                        <YAxis />
                        <Tooltip
                            labelFormatter={(label) => `x = ${parseFloat(label).toFixed(4)}`}
                            formatter={(value, name) => [parseFloat(value).toFixed(6), name === 'yTrue' ? 'f(x)' : 'f(xi)']}
                        />

                        {/* The Smooth Function Curve */}
                        <Line
                            data={data.curvePoints}
                            type="monotone"
                            dataKey="yTrue"
                            stroke="#228be6"
                            strokeWidth={3}
                            dot={false}
                            name="Fungsi f(x)"
                            activeDot={false}
                        />

                        {/* The Shaded Area (Trapezoids/Segments) */}
                        {/* We use the segment points to define the area */}
                        <Area
                            data={data.segmentPoints}
                            type={method === 'trapezoidal' ? "linear" : "monotone"} // Linear for trapezoid, smooth-ish for Simpson
                            dataKey="ySegment"
                            stroke="#fa5252"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            fill="#fa5252"
                            fillOpacity={0.2}
                            name="Area Aproksimasi"
                        />

                        {/* The Reference Points (Scatter) */}
                        <Scatter
                            data={data.segmentPoints}
                            dataKey="ySegment"
                            fill="#c92a2a"
                            name="Titik (xi, f(xi))"
                        />

                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#868e96', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                *Garis biru adalah fungsi asli. Area merah adalah pendekatan numerik dengan N={n}.
            </p>
        </div>
    );
};

export default IntegralGraph;
