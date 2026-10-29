/**
 * Validates the categorical figure palette in src/lib/palette.ts.
 *
 * Run with `node scripts/check-palette.ts`; exits non-zero on any failure.
 *
 * Separation is OKLab deltaE x100. Colour-vision deficiency is simulated with the
 * Machado et al. (2009) matrices at full severity, applied in linear sRGB.
 */
import { categorical, semantic, accent, surface, ALL_PAIRS_SAFE_SERIES } from '../src/lib/palette';

const ADJACENT_MIN = 9;
const ALL_PAIRS_MIN = 9.5;
const NEAR_RESERVED_MIN = 4;
const CONTRAST_MIN = 3;

type RGB = [number, number, number];

const parse = (hex: string): RGB =>
	[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as RGB;
const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toGamma = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

function oklab(c: RGB): RGB {
	const [r, g, b] = c.map(toLinear);
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
	return [
		0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
		1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
		0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
	];
}

const machado: Record<'protan' | 'deutan', number[][]> = {
	protan: [
		[0.152286, 1.052583, -0.204868],
		[0.114503, 0.786281, 0.099216],
		[-0.003882, -0.048116, 1.051998]
	],
	deutan: [
		[0.367322, 0.860646, -0.227968],
		[0.280085, 0.672501, 0.047413],
		[-0.01182, 0.04294, 0.968881]
	]
};

const views = ['normal', 'protan', 'deutan'] as const;

function simulate(c: RGB, view: (typeof views)[number]): RGB {
	if (view === 'normal') return c;
	const lin = c.map(toLinear);
	return machado[view].map((row) =>
		toGamma(Math.min(1, Math.max(0, row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2])))
	) as RGB;
}

/** Worst-case separation across normal vision, protanopia and deuteranopia. */
function separation(a: string, b: string): number {
	return Math.min(
		...views.map((view) => {
			const x = oklab(simulate(parse(a), view));
			const y = oklab(simulate(parse(b), view));
			return 100 * Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
		})
	);
}

function contrast(a: string, b: string): number {
	const luminance = (hex: string) => {
		const [r, g, b] = parse(hex).map(toLinear);
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	};
	const [hi, lo] = [luminance(a), luminance(b)].sort((p, q) => q - p);
	return (hi + 0.05) / (lo + 0.05);
}

const failures: string[] = [];
const check = (ok: boolean, line: string, severity: 'FAIL' | 'warn' = 'FAIL') => {
	console.log(`${ok ? 'ok  ' : severity}  ${line}`);
	if (!ok && severity === 'FAIL') failures.push(line);
};

for (const c of categorical) {
	const ratio = contrast(c, surface.deep);
	check(ratio >= CONTRAST_MIN, `${c} contrast ${ratio.toFixed(2)} against surface.deep`);
}

for (let i = 0; i + 1 < categorical.length; i++) {
	const d = separation(categorical[i], categorical[i + 1]);
	check(d >= ADJACENT_MIN, `slots ${i + 1}-${i + 2} separate by ${d.toFixed(1)}`);
}

for (let i = 0; i < ALL_PAIRS_SAFE_SERIES; i++) {
	for (let j = i + 2; j < ALL_PAIRS_SAFE_SERIES; j++) {
		const d = separation(categorical[i], categorical[j]);
		check(d >= ALL_PAIRS_MIN, `slots ${i + 1}-${j + 1} separate by ${d.toFixed(1)} (all-pairs)`);
	}
}

// Accent and status colours are always paired with a label or shape, so a near miss here
// is reported for the figure author rather than failing the palette.
const reserved = { accent, ...semantic };
for (const c of categorical) {
	for (const [name, r] of Object.entries(reserved)) {
		const d = separation(c, r);
		check(d >= NEAR_RESERVED_MIN, `${c} separates from ${name} by ${d.toFixed(1)}`, 'warn');
	}
}

if (failures.length > 0) {
	console.error(`\n${failures.length} check(s) failed`);
	process.exit(1);
}
console.log('\npalette ok');
