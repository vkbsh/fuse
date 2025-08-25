import { render } from "vitest-browser-react";
import { expect, test } from "vitest";

function Hello() {
  return <div>Hello World</div>;
}

test("counter button increments the count", async () => {
  const screen = await render(<Hello />);

  await expect.element(screen.getByText("Hello World")).toBeVisible();
});
