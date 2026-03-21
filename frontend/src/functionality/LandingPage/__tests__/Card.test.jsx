import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Card from "../Card";

describe("Card", () => {
  it("renders the avatar, stars, review and name", () => {
    render(
      <Card
        avatar="A"
        stars="★★★★★"
        review="This made planning much easier."
        name="Mohammad"
      />
    );

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("★★★★★")).toBeInTheDocument();
    expect(
      screen.getByText("This made planning much easier.")
    ).toBeInTheDocument();
    expect(screen.getByText("Mohammad")).toBeInTheDocument();
  });

  it("applies the correct class names to the main elements", () => {
    const { container } = render(
      <Card
        avatar="B"
        stars="★★★★☆"
        review="Very clean and easy to use."
        name="Aisha"
      />
    );

    expect(container.querySelector(".card")).toBeInTheDocument();
    expect(container.querySelector(".card_container")).toBeInTheDocument();
    expect(container.querySelector(".card_avatar")).toBeInTheDocument();
    expect(container.querySelector(".card_content")).toBeInTheDocument();
    expect(container.querySelector(".card_stars")).toBeInTheDocument();
    expect(container.querySelector(".card_text")).toBeInTheDocument();
    expect(container.querySelector(".card_title")).toBeInTheDocument();
  });

  it("renders the name inside italic text", () => {
    render(
      <Card
        avatar="C"
        stars="★★★☆☆"
        review="Helpful overall."
        name="Zaynab"
      />
    );

    const title = screen.getByText("Zaynab");
    expect(title.tagName).toBe("I");
  });
});

