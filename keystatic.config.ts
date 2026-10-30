import { collection, config, fields } from "@keystatic/core";

export default config({
	storage: {
		kind: "local",
	},

	collections: {
		posts: collection({
			label: "Posts",
			slugField: "title",
			path: "content/posts/*",
			format: { contentField: "content" },
			// Keep in sync with the `post` schema in src/content.config.ts
			schema: {
				title: fields.slug({ name: { label: "Title", validation: { length: { max: 60 } } } }),
				description: fields.text({ label: "Description", multiline: true }),
				publishDate: fields.date({ label: "Publish date", validation: { isRequired: true } }),
				updatedDate: fields.date({ label: "Updated date" }),
				tags: fields.array(fields.text({ label: "Tag" }), {
					label: "Tags",
					itemLabel: (props) => props.value,
				}),
				draft: fields.checkbox({ label: "Draft", defaultValue: false }),
				pinned: fields.checkbox({ label: "Pinned", defaultValue: false }),
				content: fields.mdx({ label: "Content" }),
			},
		}),
	},
});
