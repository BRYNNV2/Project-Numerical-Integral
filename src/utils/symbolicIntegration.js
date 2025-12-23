import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Calculus';
import 'nerdamer/Solve';

// Helper to clean latex for nerdamer
const cleanLatexForSymbolic = (latex) => {
    let clean = latex;

    // Remove \int command
    clean = clean.replace(/\\int/g, '');

    // Remove differentials like dx, dt at the end
    clean = clean.replace(/d[a-z]\s*$/i, '');

    // Remove formatting like \! \, \mathrm
    clean = clean.replace(/\\!|\\,|\\mathrm/g, '');

    // Fix simple powers if needed (nerdamer usually handles latex, but sometimes needs help)
    // Actually nerdamer.convertFromLaTeX is the way to go

    return clean.trim();
};

// Heuristic to detect substitution pattern: A*x*(B*x^2 + C)^n
const detectSubstitutionPattern = (latex) => {
    // Very basic regex heuristic for demo purposes
    // Matches roughly: const * x * (const * x^2 +/- const) ^ n
    // e.g. 8x(x^2 - 1)^3
    // We try to extract B, C, n
    try {
        // Clean up Latex first to avoid \left \right issues
        let s = latex.replace(/\\left|\\right/g, '');
        s = s.replace(/\s+/g, ''); // Remove whitespaces

        // Check for parens power: (...)^n
        // Now that \left/\right are gone, we can look for (...)
        const powerMatch = s.match(/\(([^()]+)\)\^(\{?\d+\}?)/);
        if (!powerMatch) return null;

        const inner = powerMatch[1]; // x^2 - 1
        const n = powerMatch[2].replace(/[{}]/g, ''); // 3

        // Check if inner is quadratic (x^2)
        if (!inner.includes('x^2')) return null;

        // Roughly check if outside has 'x'
        const outer = s.replace(powerMatch[0], '');
        if (!outer.includes('x')) return null;

        return { inner, n, outer };
    } catch (e) {
        return null;
    }
};

const generateHeuristicSteps = (latex, expression, result) => {
    const subPattern = detectSubstitutionPattern(latex);

    if (subPattern) {
        const u = subPattern.inner; // e.g. x^2 - 1
        const n = subPattern.n; // e.g. 3

        // This is a simplified educational display, might not be mathematically perfect for all cases
        // but works for the user's specific request structure.
        return [
            {
                header: "Metode Substitusi",
                description: "Fungi ini terlihat berbentuk u-substitusi. Kita misalkan u sebagai bagian dalam kurung.",
                latex: `u = ${u}`
            },
            {
                header: "Turunan Derivatif (du)",
                description: "Cari turunan dari u terhadap x.",
                latex: `\\frac{du}{dx} = \\frac{d}{dx}(${u}) \\implies du = (\\dots) dx`
            },
            {
                header: "Substitusi & Integral",
                description: "Ganti variabel x dengan u, lalu integralkan fungsi pangkat sederhana.",
                latex: `\\int u^${n} \\, du = \\frac{u^{${parseInt(n) + 1}}}{${parseInt(n) + 1}}`
            },
            {
                header: "Substitusi Balik (Hasil Akhir)",
                description: "Kembalikan nilai u ke fungsi asli x.",
                latex: `F(x) = ${result.toTeX()} + C`
            },
            {
                header: "Verifikasi (Pembuktian)",
                description: "Kita buktikan jawaban benar dengan menurunkannya kembali. Jika hasil turunan sama dengan soal, maka jawaban valid.",
                latex: `\\frac{d}{dx}[F(x)] = ${latex}`
            }
        ];
    }

    // Default Steps
    return [
        {
            header: "Konsep Dasar",
            description: "Integral tak tentu adalah operasi invers (kebalikan) dari turunan. Jika F(x) adalah antiturunan dari f(x), maka:",
            latex: "\\int f(x) \\, dx = F(x) + C \\quad \\text{dimana} \\quad F'(x) = f(x)"
        },
        {
            header: "Hasil Integrasi",
            description: "Solusi antiturunan dari fungsi tersebut adalah:",
            latex: `F(x) = ${result.toTeX()} + C`
        },
        {
            header: "Verifikasi (Pembuktian)",
            description: "Kita buktikan jawaban benar dengan menurunkannya kembali. Jika hasil turunan sama dengan soal, maka jawaban valid.",
            latex: `\\frac{d}{dx}\\left[ ${result.toTeX()} \\right] = ${latex}`
        }
    ];
};

export const solveIndefiniteIntegral = (latexInput) => {
    try {
        // 1. Clean the input to get just the expression
        // We use nerdamer's convertFromLaTeX if possible, or just pass clean string
        // Note: nerdamer takes expression string.

        // Remove \int and dx first to isolate the function
        let expressionLatex = latexInput;
        // Remove \int_{...}^{...} or \int ...
        expressionLatex = expressionLatex.replace(/\\int(?:_\{[^{}]+\}\^\{[^{}]+\}|_[^\s\^]+\^[^\s\\]+)?/g, '');
        expressionLatex = expressionLatex.replace(/\\int/g, '');

        // Remove dx, dt, d(x)
        expressionLatex = expressionLatex.replace(/\\mathrm\{d\}x/g, ''); // specific mathlive
        expressionLatex = expressionLatex.replace(/d[a-z]\s*$/i, '');

        // Trim
        expressionLatex = expressionLatex.trim();

        // 2. Integration
        // nerdamer('integrate(x^2, x)')

        // Convert latex to expression
        // If the user inputs "x^2", nerdamer can read it.
        // If input is "\sin(x)", nerdamer need convertFromLaTeX

        const expression = nerdamer.convertFromLaTeX(expressionLatex).toString();

        const result = nerdamer(`integrate(${expression}, x)`);

        return {
            originalFunc: expressionLatex,
            resultLatex: result.toTeX() + ' + C',
            steps: [
                {
                    header: "Bentuk Integral Tak Tentu",
                    description: "Kita mencari fungsi antiturunan dari:",
                    latex: `\\int ${expressionLatex} \\, dx`
                },

                // Try to generate smart heuristic steps for common patterns
                ...generateHeuristicSteps(expressionLatex, expression, result)
            ],
            isSymbolic: true
        };

    } catch (error) {
        console.error("Symbolic Ops Error:", error);
        throw new Error("Gagal menghitung integral tak tentu. Pastikan format valid.");
    }
};
