<script lang="ts">
	import * as Command from '$lib/components/ui/command';
	import { themeStore } from '$lib/theme.svelte';
	import Palette from '@lucide/svelte/icons/palette';

	let open = $state(false);

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			open = !open;
		}
	}

	function runCommand(cb: () => void) {
		cb();
		open = false;
	}

	function cycleTheme() {
		const current = themeStore.value;
		if (current === 'system') themeStore.value = 'light';
		else if (current === 'light') themeStore.value = 'dark';
		else themeStore.value = 'system';
	}
</script>

<svelte:document onkeydown={handleKeydown} />

<Command.Dialog bind:open>
	<Command.Input placeholder="Type a command or search..." />
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		<Command.Group heading="Actions">
			<Command.Item onSelect={() => runCommand(cycleTheme)}>
				<Palette class="mr-2 size-4" />
				<span>Toggle Theme ({themeStore.value})</span>
			</Command.Item>
		</Command.Group>
	</Command.List>
</Command.Dialog>
