import React from "react";

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Hero from "../landing_page/home/Hero";

describe("Hero Component", () => {
  test("renders hero heading", () => {
    render(<Hero></Hero>);
    const heroHeading = screen.getByText(/Trade Smarter/i);
    expect(heroHeading).toBeInTheDocument();
  });
});
