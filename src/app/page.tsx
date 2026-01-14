"use client";

import {
  DynamicContextProvider,
  DynamicWidget,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import React from "react";
import Navbar from "../components/navbar";

const DynamicApp = () => {
  const { user, handleLogOut } = useDynamicContext();

  React.useEffect(() => {
    if (user) {
      // Remove the dynamic jwt token from the url
      window.history.replaceState(null, "", "/");
    }
  }, [user]);

  if (!user) {
    return (
      <div className="auth-container">
        <DynamicWidget />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar
        username={user.alias || user.email || ""}
        onLogOut={handleLogOut}
      />
      <div className="main-content">{/* Main content area */}</div>
    </div>
  );
};

export default function App() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "",
        events: {
          onAuthSuccess: () => {
            // onAuthSuccess it not being called after login with gmail auth
            console.log("Auth success");
            window.history.replaceState(null, "", "/");
          },
        },
      }}
    >
      <DynamicApp />
    </DynamicContextProvider>
  );
}
