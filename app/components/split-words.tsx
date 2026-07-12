type SplitWordsProps = {
  text: string;
  wordClassName?: string;
};

/**
 * Server-renderable word splitter: the full text stays available to screen
 * readers and crawlers via a visually-hidden span, while the animated words
 * are decorative duplicates. Spaces live in text nodes between the word spans
 * so word transforms never affect spacing.
 */
export default function SplitWords({ text, wordClassName = "elc-split-word" }: SplitWordsProps) {
  const words = text.split(" ");

  return (
    <>
      <span className="elc-sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <span key={`${word}-${index}`}>
            {index > 0 ? " " : null}
            <span className={wordClassName} data-split-word>
              {word}
            </span>
          </span>
        ))}
      </span>
    </>
  );
}
