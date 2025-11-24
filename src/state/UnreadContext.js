// src/state/UnreadContext.js

import React, { createContext, useContext, useState, useMemo } from "react";

const UnreadContext = createContext(null);

export function UnreadProvider({ children }) {
  const [unreadTotal, setUnreadTotal] = useState(0);

  const value = useMemo(
    () => ({ unreadTotal, setUnreadTotal }),
    [unreadTotal]
  );

  return <UnreadContext.Provider value={value}>{children}</UnreadContext.Provider>;
}

export function useUnread() {
  const ctx = useContext(UnreadContext);
  if (!ctx) throw new Error("useUnread must be used within UnreadProvider");
  return ctx;
}
