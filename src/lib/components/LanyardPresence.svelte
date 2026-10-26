<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';

	type LanyardPresence = {
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
	};

	type Props = {
		initialPresence: LanyardPresence | null;
	};

	let { initialPresence }: Props = $props();
	let presence = $state<LanyardPresence | null>(initialPresence);
	let socket: WebSocket | null = null;
	let heartbeat: ReturnType<typeof setInterval> | null = null;
	let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	let disposed = false;

	const userId = env.PUBLIC_LANYARD_USER_ID?.trim() ?? '';

	const formatDuration = (start?: number, end?: number) => {
		if (!start) return 'unknown';
		const finish = end ?? Date.now();
		const diff = Math.max(finish - start, 0);
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(minutes / 60);
		if (hours > 0) return `${hours}h ${minutes % 60}m`;
		return `${minutes}m`;
	};

	const spotify = $derived(
		presence?.listening_to_spotify && presence.spotify ? presence.spotify : null
	);

	const messageFromPayload = (payload: unknown): LanyardPresence | null => {
		if (!payload || typeof payload !== 'object') return null;

		const data = payload as Record<string, unknown>;

		if ('listening_to_spotify' in data || 'spotify' in data) {
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
		if (!userId) return;

		const connect = () => {
			if (disposed) return;
			if (reconnectTimer) {
				clearTimeout(reconnectTimer);
				reconnectTimer = null;
			}

			socket = new WebSocket('wss://api.lanyard.rest/socket');

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
					if (nextPresence) presence = nextPresence;
				}
			});

			socket.addEventListener('close', () => {
				if (disposed) return;
				if (heartbeat) {
					clearInterval(heartbeat);
					heartbeat = null;
				}

				reconnectTimer = setTimeout(() => {
					connect();
				}, 5000);
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

{#if spotify}
	<section id="listening" class="fade-in mt-12 w-full">
		<h2 class="mb-4 text-xs font-bold tracking-[0.2em] text-ctp-subtext1">listening to</h2>

		<a
			href={spotify.track_id
				? `https://open.spotify.com/track/${spotify.track_id}`
				: 'https://open.spotify.com'}
			target="_blank"
			rel="external noopener noreferrer"
			class="group border-theme/80 flex items-center justify-between gap-4 border bg-uv-deep/50 p-3 transition-colors hover:bg-uv-mute/30"
		>
			<div class="flex min-w-0 flex-1 items-center gap-4">
				{#if spotify.album_art_url}
					<img
						src={spotify.album_art_url}
						alt={spotify.album ?? spotify.song ?? 'Spotify album art'}
						class="h-14 w-14 shrink-0 object-cover"
					/>
				{/if}
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-medium text-uv-text-main">
						{spotify.song ?? 'Unknown track'}
					</p>
					<p class="truncate text-xs text-ctp-subtext1">
						{spotify.artist ?? 'Unknown artist'}
					</p>
					<p class="mt-1 text-[11px] text-uv-text-dim">
						{spotify.album ?? 'Unknown album'} · {formatDuration(
							spotify.timestamps?.start,
							spotify.timestamps?.end
						)}
					</p>
				</div>
			</div>
			<span class="font-mono text-[10px] tracking-widest text-ctp-green">SPOTIFY</span>
			<span
				class="material-symbols-outlined text-sm text-uv-highlight transition-transform duration-300 group-hover:translate-x-1"
				>open_in_new</span
			>
		</a>
	</section>
{/if}
