import {
  PayloadLexicalReactRenderer,
  PayloadLexicalReactRendererContent,
} from ".";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

const content: PayloadLexicalReactRendererContent = {
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    children: [
      {
        detail: 0,
        format: 0,
        mode: "normal",
        style: "",
        text: "Lorem ipsum",
        type: "text",
        version: 1,
      },
    ],
    direction: "ltr",
  },
};

describe("Simple working test", () => {
  it("Should render the page correctly", async () => {
    await render(<PayloadLexicalReactRenderer content={content} />);

    const text = await screen.queryByText("Lorem ipsum");

    // Post Expectations
    expect(text).toBeInTheDocument();
  });
});

const blockContent: PayloadLexicalReactRendererContent = {
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    children: [
      {
        type: "block",
        version: 1,
        fields: {
          id: "first",
          blockName: "",
          blockType: "intro",
          text: "First intro",
        },
      },
      {
        type: "block",
        version: 1,
        fields: {
          id: "second",
          blockName: "",
          blockType: "intro",
          text: "Second intro",
        },
      },
    ],
    direction: "ltr",
  },
};

describe("Block rendering", () => {
  it("renders blocks unchanged when renderBlock is omitted", () => {
    render(
      <PayloadLexicalReactRenderer
        content={blockContent}
        blockRenderers={{
          intro: (node) => <p>{node.fields.text}</p>,
        }}
      />,
    );

    expect(screen.getByText("First intro").tagName).toBe("P");
    expect(screen.getByText("Second intro").tagName).toBe("P");
  });

  it("wraps every rendered block and provides its source node", () => {
    render(
      <PayloadLexicalReactRenderer
        content={blockContent}
        blockRenderers={{
          intro: (node) => <p>{node.fields.text}</p>,
        }}
        renderBlock={({ children, node }) => (
          <section data-testid="block-layout" data-block-id={node.fields.id}>
            {children}
          </section>
        )}
      />,
    );

    const wrappers = screen.getAllByTestId("block-layout");

    expect(wrappers).toHaveLength(2);
    expect(wrappers[0]).toHaveAttribute("data-block-id", "first");
    expect(wrappers[0]).toHaveTextContent("First intro");
    expect(wrappers[1]).toHaveAttribute("data-block-id", "second");
    expect(wrappers[1]).toHaveTextContent("Second intro");
  });

  it("uses the catchall renderer for unmatched blocks", () => {
    render(
      <PayloadLexicalReactRenderer
        content={blockContent}
        blockRenderers={{
          catchall: (node) => <p>Unsupported {node.fields.blockType}</p>,
        }}
      />,
    );

    expect(screen.getAllByText("Unsupported intro")).toHaveLength(2);
  });
});
