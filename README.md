# Keystatic

## Links

[Keystatic Astro Integration](https://docs.astro.build/en/guides/cms/keystatic/)

## Configuration

1. Move the configuration of posts to the right sidebar

```typescript
export default config({
	collections: {
		posts: collection({
			// editor in the main area, metadata fields in a side panel
			entryLayout: "content",
		}),
	},
});
```

[Entry Layout](https://keystatic.com/docs/entry-layout)
