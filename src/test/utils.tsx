import { render, RenderOptions } from "@testing-library/react";
import { ReactElement, ReactNode } from "react";

// Mock Toaster component
const MockToaster = ({ children }: { children: ReactNode }) => (
  <>{children}</>
);

// Custom render function that includes providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  const Wrapper = ({ children }: { children: ReactNode }) => {
    return <MockToaster>{children}</MockToaster>;
  };

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };

// Mock API response helper
export const mockApiResponse = <T,>(data: T, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers({
      "content-type": "application/json",
    }),
  } as Response);
};

// Mock API error helper
export const mockApiError = (message: string, status = 400) => {
  return Promise.resolve({
    ok: false,
    status,
    json: async () => ({ message }),
    text: async () => message,
    headers: new Headers({
      "content-type": "application/json",
    }),
  } as Response);
};

// Wait for async updates
export const waitForAsync = () =>
  new Promise((resolve) => setTimeout(resolve, 0));
