<script lang="ts">
	import * as Command from '$lib/components/ui/command';
	import { resolve } from '$app/paths';
	import House from '@lucide/svelte/icons/house';
	import User from '@lucide/svelte/icons/user';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import FileText from '@lucide/svelte/icons/file-text';
	import Github from '@lucide/svelte/icons/github';
	import Twitter from '@lucide/svelte/icons/twitter';
	import Mail from '@lucide/svelte/icons/mail';

	let open = $state(false);

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			open = !open;
		}
	}

	const pages = [
		{ href: resolve('/'), label: 'Home', icon: House },
		{ href: resolve('/about'), label: 'About', icon: User },
		{ href: resolve('/blog'), label: 'Blog', icon: Newspaper },
		{ href: resolve('/ai'), label: 'AI Policy', icon: Sparkles }
	];

	const links = [
		{
			href: 'https://github.com/rycerzes/resume/blob/main/resume.pdf',
			label: 'Resume',
			icon: FileText,
			newTab: true
		},
		{ href: 'https://github.com/rycerzes', label: 'GitHub', icon: Github, newTab: true },
		{ href: 'https://x.com/swaapppyyy', label: 'x / twitter', icon: Twitter, newTab: true },
		{ href: 'mailto:swapnil@rycerz.es', label: 'Email', icon: Mail, newTab: false }
	];
</script>

<svelte:document onkeydown={handleKeydown} />

<Command.Dialog bind:open>
	<Command.Input placeholder="Type a command or search..." />
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>

		<Command.Group heading="Navigation">
			{#each pages as page (page.href)}
				{@const Icon = page.icon}
				<Command.LinkItem href={page.href} onSelect={() => (open = false)}>
					<Icon class="mr-2 size-4" />
					<span>{page.label}</span>
				</Command.LinkItem>
			{/each}
		</Command.Group>

		<Command.Separator />

		<Command.Group heading="Links">
			{#each links as link (link.href)}
				{@const Icon = link.icon}
				<Command.LinkItem
					href={link.href}
					target={link.newTab ? '_blank' : undefined}
					rel={link.newTab ? 'noreferrer noopener' : undefined}
					onSelect={() => (open = false)}
				>
					<Icon class="mr-2 size-4" />
					<span>{link.label}</span>
				</Command.LinkItem>
			{/each}
		</Command.Group>
	</Command.List>
</Command.Dialog>
