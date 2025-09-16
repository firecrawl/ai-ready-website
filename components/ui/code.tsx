import SyntaxHighlighter from "react-syntax-highlighter";

import "@/styles/components/code.css";

export default function Code({
  code,
  language,
  showLineNumbers = true,
}: {
  code: string;
  language: string;
  showLineNumbers?: boolean;
}) {
  return (
    <SyntaxHighlighter
      customStyle={{}}
      language={language}
      showLineNumbers={showLineNumbers}
      useInlineStyles={false}
    >
      {code}
    </SyntaxHighlighter>
  );
}
