import * as math from 'mathjs';
import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Calculus';

// Simple Latex to MathJS converter for our supported symbols
const preprocessLatex = (latex) => {
    if (!latex) return "";
    let clean = latex;

    // Refined regex for \int with various limit formats
    // Matches \int followed by:
    // 1. _{...}^{...}
    // 2. _...^... (but strictly ensuring we don't eat the whole string)
    // We'll prioritize brace matching, then single chars or strictly non-greedy numbers if needed.
    // Safest strategy: Match \int locally.

    // Remove \int_{...}^{...} (Standard MathLive)
    clean = clean.replace(/\\int_\{([^{}]+)\}\^\{([^{}]+)\}\s*/g, "");

    // Remove \int_a^b (Single char limits or simple numbers?)
    // This is the dangerous one. Let's assume limits are short or separated by space if logical.
    // Instead of [^\s]+, let's use [a-zA-Z0-9\.]+ (alphanumeric+dot) and maybe strict braces for complex.
    // Or just simple: \int_[a-zA-Z0-9]+\^[a-zA-Z0-9]+\s*
    clean = clean.replace(/\\int_[a-zA-Z0-9]+\^[a-zA-Z0-9]+\s*/g, "");

    // Also remove just \int (no limits)
    clean = clean.replace(/\\int\s*/g, "");

    // Remove specific MathLive spacing commands like \! (negative space)
    clean = clean.replace(/\\!/g, "");

    // Aggressively remove \mathrm{d} or \mathrm(d) blocks first
    // MathJS doesn't understand \mathrm, so just strip it.
    // Matches \mathrm{...} or \mathrm(...)
    clean = clean.replace(/\\mathrm\{([^{}]+)\}/g, "$1");
    clean = clean.replace(/\\mathrm\(([^()]+)\)/g, "$1");

    // Remove dx, dt at the end, including potential latex spacing/styling
    // Matches:
    // 1. dx at end (plain)
    // 2. \, dx or \ dx
    // 3. previously stripped \mathrm{d}x which became dx
    // Added \s* at the end to handle any trailing whitespace
    clean = clean.replace(/(\\?\,|\\|\\!)*\s*d[a-z]\s*$/i, "");

    // Explicitly remove standalone "dx" if it survived (e.g. from \mathrm{d}x -> dx)
    // Only if it's at the end
    clean = clean.replace(/\s+d[a-z]\s*$/i, "");

    // Replace fractions: \frac{a}{b} -> (a)/(b)
    clean = clean.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1)/($2)");

    // Replace sqrt: \sqrt{x} -> sqrt(x)
    clean = clean.replace(/\\sqrt\{([^{}]+)\}/g, "sqrt($1)");

    // Handle trig powers BEFORE removing backslashes (to avoid ambiguity)
    // \sin^3(x) -> sin(x)^3
    // Matches: \sin (or cos, etc) ^ {n} (arg)
    // We assume arguments are in ( ) or { } or just after spacing

    // Case 1: \sin^3(x) or \sin^{3}(x)
    clean = clean.replace(/\\(sin|cos|tan|sec|csc|cot)\^\{?([0-9\.]+)\}?\s*\(([^)]+)\)/g, "$1($3)^$2");

    // Case 2: \sin^3 x (simple var) - risky but common in simple inputs
    // We'll handle explicit parens first (Case 1), then maybe check for remaining

    // Replace trig/log commands
    clean = clean.replace(/\\(sin|cos|tan|log|ln|exp|arcsin|arccos|arctan)/g, "$1");

    // Handle power { }
    // x^{3} -> x^(3)
    clean = clean.replace(/\^{([^{}]+)\}/g, "^($1)");

    // Remove left-over braces if generic: {3x} -> (3x)
    // Be careful not to break other things, but usually safe for final cleanup
    clean = clean.replace(/\{([^{}]+)\}/g, "($1)");

    // Remove \left and \right (MathLive auto-sizing)
    clean = clean.replace(/\\left|\\right/g, "");

    // Remove left-over backslashes (e.g. \,) strictly if they are just spacers
    clean = clean.replace(/\\,/g, " ");

    // Greek letters: \pi -> pi
    clean = clean.replace(/\\pi/g, "pi");

    // Multiplication \cdot
    clean = clean.replace(/\\cdot/g, "*");

    // Fix spacing
    clean = clean.trim();

    return clean;
};

// Helper to evaluate function safely
const evaluateFunc = (fStrRaw, x) => {
    try {
        const fStr = preprocessLatex(fStrRaw);
        if (!fStr.trim()) throw new Error("Empty function after cleanup");

        const scope = { x: parseFloat(x), e: Math.E, pi: Math.PI };
        const res = math.evaluate(fStr, scope);

        if (typeof res !== 'number' || isNaN(res)) {
            throw new Error(`Result is not a number: ${res}`);
        }
        return res;
    } catch (e) {
        throw new Error(`Invalid function: ${e.message} (Parsed: ${preprocessLatex(fStrRaw)})`);
    }
};

// Helper to estimate true value using High Precision Simpson's 1/3
const calculateExact = (func, a, b) => {
    try {
        // Use nerdamer for exact definite integral (Symbolic True Value)
        const cleanFunc = preprocessLatex(func);
        const result = nerdamer(`defint(${cleanFunc}, ${a}, ${b})`).text();
        // Evaluate fraction/string result to number
        return parseFloat(math.evaluate(result));
    } catch (error) {
        console.warn("Symbolic exact failed, falling back to high-precision numerical:", error);
        // Fallback: Simpson's 1/3 with N=1000
        const N = 1000;
        const h = (b - a) / N;
        let sum = evaluateFunc(func, a) + evaluateFunc(func, b);
        for (let i = 1; i < N; i++) {
            const x = a + i * h;
            const y = evaluateFunc(func, x);
            const coeff = (i % 2 === 0) ? 2 : 4;
            sum += coeff * y;
        }
        return (h / 3) * sum;
    }
};

export const calculateIntegral = (func, aStr, bStr, nStr, method) => {
    // Parsing with defaults to avoid NaN if user clears input
    const a = aStr === '' ? 0 : parseFloat(aStr);
    const b = bStr === '' ? 0 : parseFloat(bStr);

    // Default N to 4 (or 6 for Simpson 3/8) if missing, allowing users to ignore it
    let N = parseInt(nStr);
    if (isNaN(N) || N <= 0) {
        if (method === 'simpson38') {
            N = 6; // Must be multiple of 3
        } else {
            N = 4; // Must be even for Simpson 1/3, flexible for Trapezoid
        }
    }

    if (isNaN(a) || isNaN(b)) {
        throw new Error("Invalid parameters. Please check inputs.");
    }

    const h = (b - a) / N;
    const steps = [];

    // Step 1: Parameters
    steps.push({
        title: "Identifikasi Parameter",
        description: "Tentukan fungsi f(x), batas integrasi [a, b], dan jumlah pias N.",
        math: `f(x) = ${preprocessLatex(func)}, \\quad a = ${a}, \\quad b = ${b}, \\quad N = ${N} ${isNaN(parseInt(nStr)) ? '\\text{(Default)}' : ''}`
    });

    // Step 2: H calculation
    steps.push({
        title: "Hitung Lebar Pias (h)",
        description: "Hitung jarak antar titik (h).",
        math: `h = \\frac{b-a}{N} = \\frac{${b} - ${a}}{${N}} = ${parseFloat(h.toFixed(6))}`
    });

    // Step 3: Table of values
    let tableMath = "\\begin{array}{|c|c|c|} \\hline i & x_i & f(x_i) \\\\ \\hline ";
    const xValues = [];
    const yValues = [];

    for (let i = 0; i <= N; i++) {
        const x = a + i * h;
        const y = evaluateFunc(func, x); // Using mathjs evaluate
        xValues.push(x);
        yValues.push(y);
        // Limit table rows to 5 first and last to avoid UI lag if N is large
        if (N <= 10 || i < 3 || i > N - 3) {
            tableMath += `${i} & ${x.toFixed(4)} & ${y.toFixed(4)} \\\\ `;
        } else if (i === 3) {
            tableMath += `\\dots & \\dots & \\dots \\\\ `;
        }
    }
    tableMath += "\\hline \\end{array}";

    steps.push({
        title: "Tabel Nilai Fungsi",
        description: "Evaluasi f(x) pada setiap titik xi.",
        math: tableMath
    });

    // Step 4: Formula & Calculation
    let result = 0;
    let formulaMath = "";

    if (method === 'trapezoidal') {
        // Trapezoidal Rule: h/2 * (f0 + 2f1 + ... + 2fn-1 + fn)
        let sum = yValues[0] + yValues[N];
        let breakdown = `(${yValues[0].toFixed(4)} + ${yValues[N].toFixed(4)}`;

        for (let i = 1; i < N; i++) {
            sum += 2 * yValues[i];
            if (i < 3) breakdown += ` + 2(${yValues[i].toFixed(4)})`;
        }
        if (N > 3) breakdown += " + ...";
        breakdown += ")";

        result = (h / 2) * sum;
        formulaMath = `L \\approx \\frac{h}{2} [f(x_0) + 2\\sum_{i=1}^{N-1} f(x_i) + f(x_N)] \\\\ 
                   L \\approx \\frac{${parseFloat(h.toFixed(6))}}{2} ${breakdown} \\\\
                   L \\approx ${(h / 2).toFixed(6)} (${sum.toFixed(6)})`;

    } else if (method === 'simpson13') {
        if (N % 2 !== 0) throw new Error("Simpson 1/3 requires N to be even / genap.");

        // Simpson 1/3: h/3 * (f0 + 4f1 + 2f2 + 4f3 + ... + fn)
        let sum = yValues[0] + yValues[N];
        let breakdown = `(${yValues[0].toFixed(4)} + ${yValues[N].toFixed(4)}`;

        for (let i = 1; i < N; i++) {
            const coeff = (i % 2 === 0) ? 2 : 4;
            sum += coeff * yValues[i];
            if (i < 3) breakdown += ` + ${coeff}(${yValues[i].toFixed(4)})`;
        }
        if (N > 3) breakdown += " + ...";
        breakdown += ")";

        result = (h / 3) * sum;
        formulaMath = `L \\approx \\frac{h}{3} [f_0 + 4f_1 + 2f_2 + \\dots + f_N] \\\\
                    L \\approx \\frac{${parseFloat(h.toFixed(6))}}{3} ${breakdown} \\\\
                    L \\approx ${(h / 3).toFixed(6)} (${sum.toFixed(6)})`;

    } else if (method === 'simpson38') {
        if (N % 3 !== 0) throw new Error("Simpson 3/8 requires N to be multiple of 3 / kelipatan 3.");

        // Simpson 3/8: 3h/8 * (f0 + 3f1 + 3f2 + 2f3 + ... + fn)
        let sum = yValues[0] + yValues[N];

        for (let i = 1; i < N; i++) {
            const coeff = (i % 3 === 0) ? 2 : 3;
            sum += coeff * yValues[i];
        }

        result = (3 * h / 8) * sum;
        formulaMath = `L \\approx \\frac{3h}{8} [f_0 + 3f_1 + 3f_2 + 2f_3 + \\dots + f_N]`;
    }

    steps.push({
        title: "Hitung Hasil Akhir",
        description: `Gunakan rumus metode ${method} untuk mendapatkan hasil.`,
        math: formulaMath + ` \\\\ \\mathbf{L \\approx ${result.toFixed(6)}}`
    });

    // Step 5: Error Calculation
    try {
        const trueValue = calculateExact(func, a, b);
        const absError = Math.abs(trueValue - result);
        // Avoid division by zero
        const relError = Math.abs(trueValue) > 1e-10 ? (absError / Math.abs(trueValue)) * 100 : 0;

        steps.push({
            title: "Perhitungan Error (Validasi)",
            description: "Bandingkan hasil numerik dengan Nilai Sejati (Dihitung Simbolik).",
            math: `\\text{Nilai Sejati (Sejati)} \\approx ${trueValue.toFixed(6)} \\\\
             \\text{Error Mutlak} = |\\text{Sejati} - \\text{Hampiran}| = |${trueValue.toFixed(6)} - ${result.toFixed(6)}| = ${absError.toFixed(6)} \\\\
             \\text{Error Relatif} = \\left| \\frac{\\text{Error Mutlak}}{\\text{Sejati}} \\right| \\times 100\\% = ${relError.toFixed(4)}\\%`
        });
    } catch (e) {
        console.warn("Could not calculate exact value for error estimation", e);
    }

    return {
        func, lowerLimit: a, upperLimit: b, nValue: N, method,
        result,
        steps
    };
};
