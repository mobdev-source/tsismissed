"use client";

import * as Toast from "@radix-ui/react-toast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <Toast.Provider swipeDirection="right">
      {children}
      <Toast.Viewport className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-full" />
    </Toast.Provider>
  );
}
