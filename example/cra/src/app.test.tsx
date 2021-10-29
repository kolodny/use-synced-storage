import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import App from "./app";

test("Handles multiple renders on same page", () => {
  window.localStorage.clear();
  render(<App />);
  expect(screen.getByText(/count is 0/i)).toBeInTheDocument();
  fireEvent.click(screen.getAllByText(/click me/i)[1]);
  expect(screen.getByText(/first count is 1/i)).toBeInTheDocument();
  expect(screen.getByText(/second count is 1/i)).toBeInTheDocument();
});

test("Handles manual changes to localStorage", async () => {
  window.localStorage.clear();
  render(<App />);
  expect(screen.getByText(/count is 0/i)).toBeInTheDocument();
  window.localStorage.setItem(
    "state",
    JSON.stringify({ value: JSON.stringify({ count: 5 }) })
  );
  await screen.findByText(/first count is 5/i)
  await screen.findByText(/second count is 5/i)
});

test("Handles changes from another tab", async () => {
  window.localStorage.clear();
  const app1 = render(<App />);
  const app2 = render(<App />);
  expect(app1.container.innerHTML.includes("count is 0")).toBeTruthy()
  expect(app2.container.innerHTML.includes("count is 0")).toBeTruthy()
  fireEvent.click(app1.getAllByText(/click me/i)[1]);
  expect(app1.container.innerHTML.includes("count is 1")).toBeTruthy()
  expect(app2.container.innerHTML.includes("count is 1")).toBeTruthy()
});
