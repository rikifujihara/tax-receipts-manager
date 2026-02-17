import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

test("Assertion", () => {
  expect(1).toBe(1);
  render(<Home />);
  const main = screen.getByRole("main");
  expect(main).toBeInTheDocument();
});
