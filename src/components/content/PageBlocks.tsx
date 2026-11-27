import type { PageBlock } from "@/lib/content/pages";

/** Paragraphs and lists of a text page, on the website and in the admin preview. */
export function PageBlocks({ blocks }: { blocks: PageBlock[] }) {
  return (
    <div className="space-y-3 text-sm sm:text-[15px] leading-relaxed text-[#555C4A]">
      {blocks.map((block, index) =>
        block.type === "list" ? (
          <ul key={index} className="list-disc space-y-1.5 pl-5">
            {block.items.map((item, position) => (
              <li key={position} className="break-words">{item}</li>
            ))}
          </ul>
        ) : (
          <p key={index} className="whitespace-pre-line break-words">{block.text}</p>
        ),
      )}
    </div>
  );
}
