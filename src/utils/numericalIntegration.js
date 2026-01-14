import * as math from 'mathjs';
import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Calculus';

// Helper to extract balanced brace content
const extractArg = (str, startIdx) => {
    let balance = 0;
    let content = "";
    let i = startIdx;

    // Skip initial whitespace or non-brace chars if needed, but usually we start at {
    if (str[i] !== '{') return { content: "", endIdx: i }; // Should not happen if called correctly

    for (; i < str.length; i++) {
        const char = str[i];
        if (char === '{') {
            balance++;
            if (balance > 1) content += char; // Don't include outer {
        } else if (char === '}') {
            balance--;
            if (balance === 0) {
                // Done
                return { content, endIdx: i };
            } else {
                content += char;
            }
        } else {
            content += char;
        }
    }
    return { content, endIdx: i };
};

// Simple Latex to MathJS converter for our supported symbols
export const preprocessLatex = (latex) => {
    if (!latex) return "";
    let clean = latex;

    // 0. Global Cleanup: Remove strict formatting wrappers
    clean = clean.replace(/\\left|\\right/g, "");
    clean = clean.replace(/\\!/g, "");
    clean = clean.replace(/\$/g, "");
    clean = clean.replace(/\\mathrm\{([^{}]+)\}/g, "$1");
    clean = clean.replace(/\\text\{([^{}]+)\}/g, "$1");

    // 1. Strip function definitions
    clean = clean.replace(/^\s*[a-zA-Z]+\s*(?:\([a-zA-Z0-9]+\))?\s*(?:=|:|\\colon)\s*/, "");

    // Remove \int_{...}^{...} (Standard MathLive)
    // We use a loop to handle nested braces in limits if necessary, but regex usually suffices for limits 
    // unless they are very complex. For now, regex is okay for limits removal as they are removed entirely.
    clean = clean.replace(/\\int_\{([^{}]+)\}\^\{([^{}]+)\}\s*/g, "");
    clean = clean.replace(/\\int_[a-zA-Z0-9]+\^[a-zA-Z0-9]+\s*/g, "");
    clean = clean.replace(/\\int\s*/g, "");

    // Differentials cleanup
    clean = clean.replace(/\\text\{d\}[a-z]/gi, "");
    clean = clean.replace(/\\mathrm\{d\}[a-z]/gi, "");
    clean = clean.replace(/(\\?\,|\\|\\!)*\s*d[a-z](?![a-z])/gi, "");

    // 2. Handle Recursive/Nested Commands (\sqrt, \frac) manually
    // We cannot use simple regex replacement for these because of nested braces { }

    // Helper to replace specific command with a transform function
    const replaceCommand = (input, entryCmd, transformFn) => {
        let output = "";
        let i = 0;
        while (i < input.length) {
            if (input.substr(i).startsWith(entryCmd)) {
                // Found command, look for first brace
                const braceStart = input.indexOf('{', i + entryCmd.length);
                if (braceStart !== -1) {
                    // Extract first arg
                    const arg1 = extractArg(input, braceStart);

                    // If command is \frac, we need second arg
                    let replacement = "";
                    let nextIdx = arg1.endIdx + 1;

                    if (entryCmd === "\\frac") {
                        // Look for second brace
                        const braceStart2 = input.indexOf('{', nextIdx);
                        if (braceStart2 !== -1) {
                            const arg2 = extractArg(input, braceStart2);
                            // Process recursive inside args!
                            const procArg1 = preprocessLatex(arg1.content); // Recurse
                            const procArg2 = preprocessLatex(arg2.content); // Recurse
                            replacement = transformFn(procArg1, procArg2);
                            i = arg2.endIdx + 1;
                        } else {
                            // Malformed frac, just keep going or fail?
                            // Let's just output command as is (fail gracefully)
                            output += input.substring(i, nextIdx);
                            i = nextIdx;
                        }
                    } else {
                        // Single arg command (sqrt)
                        const procArg1 = preprocessLatex(arg1.content); // Recurse
                        replacement = transformFn(procArg1);
                        i = arg1.endIdx + 1;
                    }

                    if (replacement) output += replacement;
                } else {
                    // No brace found after command, just print command char
                    output += input[i];
                    i++;
                }
            } else {
                output += input[i];
                i++;
            }
        }
        return output;
    };

    // Replace \sqrt{...} -> sqrt(...)
    if (clean.includes("\\sqrt")) {
        clean = replaceCommand(clean, "\\sqrt", (a) => `sqrt(${a})`);
    }

    // Replace \frac{...}{...} -> (...)/(...)
    if (clean.includes("\\frac")) {
        clean = replaceCommand(clean, "\\frac", (a, b) => `(${a})/(${b})`);
    }

    // 3. Post-recursion cleanups (simple replacements)

    // Trig powers: \sin^3(x) -> sin(x)^3
    clean = clean.replace(/\\(sin|cos|tan|sec|csc|cot)\^\{?([0-9\.]+)\}?\s*\(([^)]+)\)/g, "$1($3)^$2");

    // Replace trig/log commands
    clean = clean.replace(/\\(sin|cos|tan|csc|sec|cot|log|ln|exp|arcsin|arccos|arctan)/g, "$1");

    // Explicit function calls: "sin x" -> "sin(x)"
    clean = clean.replace(/(sin|cos|tan|csc|sec|cot|log|ln|exp|arcsin|arccos|arctan)\s+(?![\(\[])([a-zA-Z0-9\.]+)/g, "$1($2)");

    // Powers with braces: x^{3} -> x^(3)
    // Note: If we already did recursion, x^{3} might remain if it wasn't inside sqrt/frac.
    // We still need to handle top-level powers.
    // However, replaceCommand logic above doesn't touch things outside commands.
    // So x^{2} is still x^{2}.
    clean = clean.replace(/\^{([^{}]+)\}/g, "^($1)");

    // Generic { } removal: {3x} -> (3x)
    clean = clean.replace(/\{([^{}]+)\}/g, "($1)");

    // Multiplications and miscellany
    clean = clean.replace(/\\,/g, " ");
    clean = clean.replace(/\\pi/g, "pi");
    clean = clean.replace(/\\cdot/g, "*");

    return clean.trim();
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
    // Helper for visual substitution
    const formatSubstitution = (fStrRaw, xVal) => {
        try {
            // Clean the function string for display purposes
            // Strip '$' to avoid breaking array math mode
            let cleanStr = fStrRaw.replace(/\$/g, "");
            // Reduce visual clutter
            cleanStr = cleanStr.replace(/\\left|\\right/g, "");
            // Remove function prefixes if they exist in raw string (e.g. f(x)=)
            cleanStr = cleanStr.replace(/^\s*[a-zA-Z]+\s*(?:\([a-zA-Z0-9]+\))?\s*(?:=|:|\\colon)\s*/, "");

            // Strip differentials for display (matches preprocessLatex logic)
            cleanStr = cleanStr.replace(/\\text\{d\}[a-z]/gi, "");
            cleanStr = cleanStr.replace(/\\mathrm\{d\}[a-z]/gi, "");
            cleanStr = cleanStr.replace(/(\\?\,|\\|\\!)*\s*d[a-z](?![a-z])/gi, "");

            const valStr = xVal < 0 ? `(${xVal.toFixed(4)})` : xVal.toFixed(4);

            // Replace x with value
            return cleanStr.replace(/(?<![a-zA-Z\\])x(?![a-zA-Z])/g, `(${valStr})`);
        } catch (e) {
            return fStrRaw;
        }
    };

    let tableMath = "\\begin{array}{|c|c|l|c|} \\hline i & x_i & f(x_i) \\text{ (Evaluasi)} & f(x_i) \\\\ \\hline ";
    const xValues = [];
    const yValues = [];

    for (let i = 0; i <= N; i++) {
        const x = a + i * h;
        const y = evaluateFunc(func, x); // Using mathjs evaluate
        xValues.push(x);
        yValues.push(y);

        const subStr = formatSubstitution(func, x);

        // Limit table rows to 5 first and last to avoid UI lag if N is large
        if (N <= 10 || i < 3 || i > N - 3) {
            tableMath += `${i} & ${x.toFixed(4)} & f(${x.toFixed(4)}) = ${subStr} & ${y.toFixed(4)} \\\\ `;
        } else if (i === 3) {
            tableMath += `\\dots & \\dots & \\dots & \\dots \\\\ `;
        }
    }
    tableMath += "\\hline \\end{array}";

    steps.push({
        title: "Tabel Nilai Fungsi",
        description: "Evaluasi f(x) pada setiap titik xi dengan mensubstitusi nilai x.",
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

    // Step 5: Symbolic / Exact Value Analysis
    let trueValue = null;
    try {
        const cleanFunc = preprocessLatex(func);

        // 1. Get Indefinite Integral (Antiderivative) F(x)
        // using nerdamer's symbolic engine
        const antiderivativeObj = nerdamer(`integrate(${cleanFunc}, x)`);
        const antiderivativeLatex = antiderivativeObj.toTeX();
        const antiderivativeStr = antiderivativeObj.text(); // raw string for evaluation

        // 2. Evaluate F(b) and F(a)
        // Note: nerdamer.evaluate might be better but math.evaluate is robust for arithmetic
        const scopeB = { x: b, e: Math.E, pi: Math.PI };
        const scopeA = { x: a, e: Math.E, pi: Math.PI };

        // We evaluate the raw antiderivative string
        const Fb = math.evaluate(antiderivativeStr, scopeB);
        const Fa = math.evaluate(antiderivativeStr, scopeA);

        trueValue = Fb - Fa; // This is the exact value derived step-by-step

        const stepMath = `\\text{Cari Antiturunan } F(x): \\\\
        \\int ${preprocessLatex(func)} \\, dx = ${antiderivativeLatex} + C \\\\
        \\text{Evaluasi Batas } [a, b] = [${a}, ${b}]: \\\\
        \\begin{aligned}
        I_{true} &=F(b) - F(a) \\\\
        &= [${antiderivativeLatex}]_{${a}}^{${b}} \\\\
        &= (${Fb.toFixed(6)}) - (${Fa.toFixed(6)}) \\\\
        &= \\mathbf{${trueValue.toFixed(6)}}
        \\end{aligned}`;

        steps.push({
            title: "Analisis Nilai Sejati (Kalkulus)",
            description: "Mencari nilai eksak dengan integral analitik untuk validasi.",
            math: stepMath
        });

    } catch (e) {
        console.warn("Symbolic analysis failed:", e);
        // Fallback or skip step if symbolic fails
        // We still strictly need trueValue for error calc, so we might try the old calculateExact method as backup
        if (trueValue === null) {
            try {
                trueValue = calculateExact(func, a, b);
            } catch (ex) { trueValue = 0; }
        }
    }
    let absError = null;
    let relError = null;

    try {
        trueValue = calculateExact(func, a, b);
        absError = Math.abs(trueValue - result);
        // Avoid division by zero
        relError = Math.abs(trueValue) > 1e-10 ? (absError / Math.abs(trueValue)) * 100 : 0;

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
        trueValue, absError, relError, // Expose for comparison
        steps
    };
};
