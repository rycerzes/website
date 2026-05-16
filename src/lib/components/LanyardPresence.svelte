<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';

	type LanyardActivity = {
		id?: string;
		name?: string;
		type?: number;
		details?: string;
		state?: string;
		url?: string | string[];
		application_id?: string;
		sync_id?: string;
		created_at?: number;
		timestamps?: {
			start?: number;
			end?: number;
		};
		assets?: {
			large_image?: string;
			large_text?: string;
			small_image?: string;
			small_text?: string;
		};
		emoji?: {
			name?: string;
			id?: string;
			animated?: boolean;
		};
	};

	type LanyardPresence = {
		discord_user?: {
			id?: string;
			username?: string;
			global_name?: string | null;
			display_name?: string | null;
			avatar?: string | null;
			discriminator?: string;
			primary_guild?: {
				tag?: string | null;
			};
		};
		discord_status?: 'online' | 'idle' | 'dnd' | 'offline' | string;
		active_on_discord_desktop?: boolean;
		active_on_discord_mobile?: boolean;
		active_on_discord_web?: boolean;
		active_on_discord_embedded?: boolean;
		active_on_discord_vr?: boolean;
		listening_to_spotify?: boolean;
		spotify?: {
			track_id?: string;
			song?: string;
			artist?: string;
			album?: string;
			album_art_url?: string;
			timestamps?: {
				start?: number;
				end?: number;
			};
		} | null;
		activities?: LanyardActivity[];
		kv?: Record<string, string>;
	};

	type Props = {
		initialPresence: LanyardPresence | null;
	};

	let { initialPresence }: Props = $props();
	let presence = $state<LanyardPresence | null>(initialPresence);
	let connectionState = $state<'connecting' | 'live' | 'disconnected' | 'missing-id'>('connecting');
	let socket: WebSocket | null = null;
	let heartbeat: ReturnType<typeof setInterval> | null = null;
	let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	let disposed = false;

	const userId = env.PUBLIC_LANYARD_USER_ID?.trim() ?? '';

	const statusLabel = (status?: string) => {
		switch (status) {
			case 'online':
				return 'online';
			case 'idle':
				return 'idle';
			case 'dnd':
				return 'do not disturb';
			case 'offline':
				return 'offline';
			default:
				return status ?? 'unknown';
		}
	};

	const statusTone = (status?: string) => {
		switch (status) {
			case 'online':
				return 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10';
			case 'idle':
				return 'text-amber-300 border-amber-500/40 bg-amber-500/10';
			case 'dnd':
				return 'text-rose-300 border-rose-500/40 bg-rose-500/10';
			case 'offline':
				return 'text-slate-300 border-slate-500/40 bg-slate-500/10';
			default:
				return 'text-violet-200 border-violet-500/40 bg-violet-500/10';
		}
	};

	const activityLabel = (type?: number) => {
		switch (type) {
			case 0:
				return 'playing';
			case 1:
				return 'streaming';
			case 2:
				return 'listening';
			case 3:
				return 'watching';
			case 4:
				return 'status';
			case 5:
				return 'competing';
			default:
				return 'activity';
		}
	};

	const activityHeading = (activity: LanyardActivity) =>
		activity.type === 4
			? activity.state?.trim() || 'Status'
			: (activity.name ?? 'Unknown activity');

	const formatDateTime = (timestamp?: number) => {
		if (!timestamp) return 'unknown';
		return new Date(timestamp).toLocaleString();
	};

	const formatDuration = (start?: number, end?: number) => {
		if (!start) return 'unknown';
		const finish = end ?? Date.now();
		const diff = Math.max(finish - start, 0);
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(minutes / 60);
		if (hours > 0) return `${hours}h ${minutes % 60}m`;
		return `${minutes}m`;
	};

	const activityUrl = (activity: LanyardActivity) => {
		if (Array.isArray(activity.url)) {
			return activity.url[0] ?? null;
		}
		return activity.url ?? null;
	};

	const isSpotifyActivity = (activity: LanyardActivity) =>
		activity.type === 2 && activity.name === 'Spotify';

	const visibleActivities = (value: LanyardPresence | null) =>
		(value?.activities ?? []).filter((activity) => !isSpotifyActivity(activity));

	const messageFromPayload = (payload: unknown): LanyardPresence | null => {
		if (!payload || typeof payload !== 'object') return null;

		const data = payload as Record<string, unknown>;

		if ('discord_user' in data) {
			return data as LanyardPresence;
		}

		if (userId && userId in data) {
			return data[userId] as LanyardPresence;
		}

		const firstValue = Object.values(data)[0];
		if (firstValue && typeof firstValue === 'object') {
			return firstValue as LanyardPresence;
		}

		return null;
	};

	onMount(() => {
		if (!userId) {
			connectionState = 'missing-id';
			return;
		}

		const connect = () => {
			if (disposed) return;
			if (reconnectTimer) {
				clearTimeout(reconnectTimer);
				reconnectTimer = null;
			}

			socket = new WebSocket('wss://api.lanyard.rest/socket');

			socket.addEventListener('open', () => {
				connectionState = 'connecting';
			});

			socket.addEventListener('message', (event) => {
				let payload: {
					op?: number;
					t?: string;
					d?: unknown;
				};

				try {
					payload = JSON.parse(event.data as string) as typeof payload;
				} catch {
					return;
				}

				if (payload.op === 1) {
					const heartbeatInterval = (payload.d as { heartbeat_interval?: number } | undefined)
						?.heartbeat_interval;

					if (heartbeatInterval) {
						if (heartbeat) clearInterval(heartbeat);
						heartbeat = setInterval(() => {
							if (socket?.readyState === WebSocket.OPEN) {
								socket.send(JSON.stringify({ op: 3 }));
							}
						}, heartbeatInterval);
					}

					socket?.send(
						JSON.stringify({
							op: 2,
							d: {
								subscribe_to_ids: [userId]
							}
						})
					);
					return;
				}

				if (payload.op !== 0) return;

				if (payload.t === 'INIT_STATE' || payload.t === 'PRESENCE_UPDATE') {
					const nextPresence = messageFromPayload(payload.d);
					if (nextPresence) {
						presence = nextPresence;
						connectionState = 'live';
					}
				}
			});

			socket.addEventListener('close', () => {
				if (disposed) return;
				connectionState = 'disconnected';
				if (heartbeat) {
					clearInterval(heartbeat);
					heartbeat = null;
				}

				reconnectTimer = setTimeout(() => {
					connect();
				}, 5000);
			});

			socket.addEventListener('error', () => {
				connectionState = 'disconnected';
			});
		};

		connect();

		return () => {
			disposed = true;
			if (reconnectTimer) clearTimeout(reconnectTimer);
			if (heartbeat) clearInterval(heartbeat);
			socket?.close();
		};
	});
</script>

<section id="presence" class="fade-in mb-6 w-full">
	<div class="mb-6 flex items-end justify-between border-b border-theme pb-2">
		<h2 class="text-xs font-bold tracking-[0.2em] text-violet-200">activity</h2>
		<div class="flex items-center gap-2 font-mono text-[10px] tracking-widest text-uv-text-dim">
			<span class={`rounded border px-2 py-0.5 ${statusTone(presence?.discord_status)}`}>
				{statusLabel(presence?.discord_status)}
			</span>
			<span>
				{connectionState === 'live'
					? 'WS LIVE'
					: connectionState === 'missing-id'
						? 'MISSING ENV'
						: connectionState === 'disconnected'
							? 'WS STALE'
							: 'WS CONNECTING'}
			</span>
		</div>
	</div>

	<div class="space-y-3">
		<div class="border-theme/80 border bg-uv-deep/50 p-4">
			<div class="space-y-2">
				<p class="text-[11px] text-uv-text-dim">Current Discord activities from the live socket</p>
				{#if presence?.listening_to_spotify && presence.spotify}
					<a
						href={presence.spotify.track_id
							? `https://open.spotify.com/track/${presence.spotify.track_id}`
							: 'https://open.spotify.com'}
						target="_blank"
						rel="noopener noreferrer"
						class="group border-theme/60 flex items-center justify-between gap-4 border bg-uv-mute/20 p-3 transition-colors hover:bg-uv-mute/30"
					>
						<div class="flex min-w-0 flex-1 items-center gap-4">
							{#if presence.spotify.album_art_url}
								<img
									src={presence.spotify.album_art_url}
									alt={presence.spotify.album ?? presence.spotify.song ?? 'Spotify album art'}
									class="h-14 w-14 shrink-0 object-cover"
								/>
							{/if}
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-medium text-white">
									{presence.spotify.song ?? 'Unknown track'}
								</p>
								<p class="truncate text-xs text-violet-200">
									{presence.spotify.artist ?? 'Unknown artist'}
								</p>
								<p class="mt-1 text-[11px] text-uv-text-dim">
									{presence.spotify.album ?? 'Unknown album'} · {formatDuration(
										presence.spotify.timestamps?.start,
										presence.spotify.timestamps?.end
									)}
								</p>
							</div>
						</div>
						<span class="font-mono text-[10px] tracking-widest text-green-400">SPOTIFY</span>
						<span
							class="material-symbols-outlined text-sm text-violet-400 transition-transform duration-300 group-hover:translate-x-1"
							>open_in_new</span
						>
					</a>
				{/if}

				{#if visibleActivities(presence).length}
					{#each visibleActivities(presence) as activity}
						<article class="border-theme/60 border bg-uv-mute/20 p-3">
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div class="min-w-0 flex-1">
									<div class="flex flex-wrap items-center gap-2">
										<span
											class="rounded border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] tracking-[0.2em] text-violet-200 uppercase"
										>
											{activityLabel(activity.type)}
										</span>
										<h4 class="truncate text-sm font-medium text-white">
											{activityHeading(activity)}
										</h4>
									</div>
									{#if activity.details}
										<p class="mt-2 text-sm text-uv-text-dim">{activity.details}</p>
									{/if}
									{#if activity.type !== 4 && activity.state}
										<p class="mt-1 text-xs text-violet-200">{activity.state}</p>
									{/if}
								</div>

								<div class="text-right text-[11px] text-uv-text-dim">
									{#if activity.timestamps?.start}
										<p>Started {formatDateTime(activity.timestamps.start)}</p>
									{/if}
									{#if activity.timestamps?.end}
										<p>Ends {formatDateTime(activity.timestamps.end)}</p>
									{/if}
									{#if activity.timestamps?.start || activity.timestamps?.end}
										<p class="mt-1 text-violet-200">
											Duration {formatDuration(
												activity.timestamps?.start,
												activity.timestamps?.end
											)}
										</p>
									{/if}
								</div>
							</div>

							{#if activity.assets?.large_image || activity.assets?.small_image || activity.emoji}
								<div class="mt-3 flex flex-wrap gap-2 text-[11px] text-uv-text-dim">
									{#if activity.assets?.large_image}
										<span class="border-theme/60 rounded border px-2 py-1"
											>large: {activity.assets.large_text ?? activity.assets.large_image}</span
										>
									{/if}
									{#if activity.assets?.small_image}
										<span class="border-theme/60 rounded border px-2 py-1"
											>small: {activity.assets.small_text ?? activity.assets.small_image}</span
										>
									{/if}
									{#if activity.emoji?.name}
										<span class="border-theme/60 rounded border px-2 py-1"
											>emoji: {activity.emoji.name}</span
										>
									{/if}
								</div>
							{/if}

							{#if activityUrl(activity)}
								<div class="mt-3">
									<a
										href={activityUrl(activity) ?? '#'}
										target="_blank"
										rel="noopener noreferrer"
										class="text-xs text-violet-300 underline decoration-dotted underline-offset-4 transition-colors hover:text-violet-200"
									>
										Open linked activity
									</a>
								</div>
							{/if}
						</article>
					{/each}
				{:else}
					<div class="px-1 py-2 text-xs text-uv-text-dim">No active activities right now.</div>
				{/if}
			</div>
		</div>

		{#if presence?.kv && Object.keys(presence.kv).length}
			<div class="border-theme/80 border bg-uv-deep/50 p-4">
				<div class="mb-3">
					<p class="text-[10px] font-bold tracking-[0.22em] text-violet-200 uppercase">KV</p>
					<p class="text-[11px] text-uv-text-dim">Lanyard key/value data attached to the profile</p>
				</div>
				<div class="grid gap-2 md:grid-cols-2">
					{#each Object.entries(presence.kv) as [key, value]}
						<div class="border-theme/60 border bg-uv-mute/20 p-3">
							<p class="text-[10px] tracking-[0.2em] text-violet-200 uppercase">{key}</p>
							<p class="mt-1 text-sm text-uv-text-dim">{value}</p>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</section>
