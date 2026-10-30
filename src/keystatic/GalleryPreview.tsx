import { useEffect, useState } from "react";

interface Props {
	value: {
		images: ReadonlyArray<{
			src: { data: Uint8Array; extension: string } | null;
			alt: string;
		}>;
	};
}

// Editor-only preview for the Gallery block (see keystatic.config.ts). The site renders src/components/Gallery.astro.
export default function GalleryPreview({ value }: Props) {
	const [urls, setUrls] = useState<{ url: string; alt: string }[]>([]);

	useEffect(() => {
		const next = value.images.flatMap(({ src, alt }) =>
			src
				? [
						{
							url: URL.createObjectURL(new Blob([src.data as BlobPart], { type: `image/${src.extension}` })),
							alt,
						},
					]
				: [],
		);
		setUrls(next);
		return () => next.forEach(({ url }) => URL.revokeObjectURL(url));
	}, [value.images]);

	if (!urls.length) return <p style={{ opacity: 0.6 }}>No images yet</p>;

	return (
		<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 8 }}>
			{urls.map(({ url, alt }, i) => (
				<img
					key={i}
					alt={alt}
					src={url}
					style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 4 }}
				/>
			))}
		</div>
	);
}
