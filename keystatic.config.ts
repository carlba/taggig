import { collection, config, fields } from "@keystatic/core";
import { block } from "@keystatic/core/content-components";
import GalleryPreview from "@/keystatic/GalleryPreview";

export default config({
	// Edits are commits to GitHub in production (Cloudflare has no writable filesystem)
	storage: { kind: "github", repo: "carlba/taggig" },

	collections: {
		posts: collection({
			label: "Posts",
			slugField: "title",
			path: "content/posts/*",
			format: { contentField: "content" },
			// editor in the main area, metadata fields in a side panel
			entryLayout: "content",
			// Keep in sync with the `post` schema in src/content.config.ts
			schema: {
				title: fields.slug({ name: { label: "Title", validation: { length: { max: 60 } } } }),
				description: fields.text({ label: "Description" }),
				publishDate: fields.date({ label: "Publish date", validation: { isRequired: true } }),
				updatedDate: fields.date({ label: "Updated date" }),
				tags: fields.array(fields.text({ label: "Tag" }), {
					label: "Tags",
					itemLabel: (props) => props.value,
				}),
				draft: fields.checkbox({ label: "Draft", defaultValue: false }),
				pinned: fields.checkbox({ label: "Pinned", defaultValue: false }),
				content: fields.mdx({
					label: "Content",
					// Astro resolves image links relative to the post file
					options: { image: { directory: "content/posts/images", publicPath: "./images/" } },
					components: {
						// rendered by src/components/Gallery.astro (passed to <Content components> in the post page)
						Gallery: block({
							label: "Gallery",
							ContentView: GalleryPreview,
							schema: {
								images: fields.array(
									fields.object({
										src: fields.image({
											label: "Image",
											directory: "content/posts/images",
											publicPath: "./images/",
											validation: { isRequired: true },
										}),
										alt: fields.text({ label: "Alt text" }),
									}),
									{ label: "Images", itemLabel: (props) => props.fields.alt.value || "Image" },
								),
							},
						}),
					},
				}),
			},
		}),
	},
});
