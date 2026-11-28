/**
 * Data for the decision-model post's figures.
 *
 * `training` is the trackio log of the Qwen3.5-4B-Decision run (bucket
 * rycerzes/sft-decision-model-4b-trackio-bucket, metrics.parquet), one row per 25 optimizer
 * steps: train/global_step, train/loss, train/accuracy, train/brier. Each value is the mean
 * over the logged steps' batches of 32 training questions.
 *
 * `results` is the evaluation through `transformers serve`, from the recipe's README in
 * huggingface/trl#7784.
 */

export type TrainingRow = { step: number; loss: number; accuracy: number; brier: number };

const rows: [number, number, number, number][] = [
	[25, 0.982, 0.5913, 0.4771],
	[50, 0.8151, 0.6663, 0.3989],
	[75, 0.8443, 0.6637, 0.4049],
	[100, 0.815, 0.665, 0.3817],
	[125, 0.8103, 0.6875, 0.3743],
	[150, 0.7386, 0.69, 0.3546],
	[175, 0.8102, 0.6813, 0.387],
	[200, 0.7254, 0.7075, 0.3496],
	[225, 0.7065, 0.7238, 0.3274],
	[250, 0.7213, 0.6937, 0.3359],
	[275, 0.7161, 0.715, 0.3425],
	[300, 0.704, 0.71, 0.3315],
	[325, 0.7359, 0.7175, 0.3444],
	[350, 0.6815, 0.7438, 0.3095],
	[375, 0.6873, 0.7462, 0.3132],
	[400, 0.7314, 0.7188, 0.3396],
	[425, 0.6288, 0.76, 0.2953],
	[450, 0.6191, 0.76, 0.2961],
	[475, 0.672, 0.7262, 0.3094],
	[500, 0.6342, 0.77, 0.2898],
	[525, 0.6673, 0.7438, 0.3017],
	[550, 0.6407, 0.7375, 0.3011],
	[575, 0.622, 0.7725, 0.277],
	[600, 0.5958, 0.7562, 0.2866],
	[625, 0.686, 0.73, 0.3245],
	[650, 0.6063, 0.7662, 0.2891],
	[675, 0.6219, 0.7462, 0.2897],
	[700, 0.5977, 0.7625, 0.2786],
	[725, 0.6103, 0.7512, 0.2855],
	[750, 0.6365, 0.7275, 0.3005],
	[775, 0.557, 0.7887, 0.2592],
	[800, 0.6616, 0.7388, 0.3149],
	[825, 0.6102, 0.7588, 0.2808],
	[850, 0.6351, 0.7375, 0.2973],
	[875, 0.5902, 0.7725, 0.2726],
	[900, 0.6089, 0.7512, 0.2885],
	[925, 0.5614, 0.7863, 0.263],
	[950, 0.5888, 0.7825, 0.2728]
];

export const training: TrainingRow[] = rows.map(([step, loss, accuracy, brier]) => ({
	step,
	loss,
	accuracy,
	brier
}));

export const TOTAL_STEPS = 961;

export type ResultRow = { label: string; base: number; trained: number };
export type Benchmark = { name: string; note: string; rows: ResultRow[] };

export const results: Benchmark[] = [
	{
		name: 'typed-decisions',
		note: '400 states × 5 questions',
		rows: [
			{ label: 'all', base: 0.56, trained: 0.673 },
			{ label: 'noul', base: 0.655, trained: 0.745 },
			{ label: 'choice', base: 0.615, trained: 0.682 },
			{ label: 'score', base: 0.449, trained: 0.614 }
		]
	},
	{
		name: 'JevBench',
		note: '1,938 questions',
		rows: [
			{ label: 'all', base: 0.874, trained: 0.891 },
			{ label: 'noul', base: 0.974, trained: 0.984 },
			{ label: 'choice', base: 0.865, trained: 0.896 },
			{ label: 'score', base: 0.408, trained: 0.429 }
		]
	}
];

export function linear(d0: number, d1: number, r0: number, r1: number): (v: number) => number {
	return (v) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
}

export const pct = (v: number, digits = 0) => `${(v * 100).toFixed(digits)}%`;
