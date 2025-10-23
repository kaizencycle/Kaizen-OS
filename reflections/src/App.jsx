import ReflectionsPage from "./ReflectionsPage";
import ChatBox from "./ChatBox";
// ... or route to it after unlock + companion setup
export default function App() {
  return <ChatBox />;
}

function App() {
  return <ReflectionsPage />;
}

export default App;

import { useState, useEffect } from "react";
import ReflectionsPage from "./ReflectionsPage";
import UnlockPage from "./UnlockPage";
import { introspectToken } from "./api";

function App() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    introspectToken(token).then((info) => {
      if (info.ok) setUnlocked(true);
    });
  }, []);

  if (!unlocked) {
    return <UnlockPage onUnlock={() => setUnlocked(true)} />;
  }

  return <ReflectionsPage />;
}

export default App;

import { useState, useEffect } from "react";
import UnlockPage from "./UnlockPage";
import CompanionPage from "./CompanionPage";
import ReflectionsPage from "./ReflectionsPage";
import { introspectToken } from "./api";

function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [hasCompanion, setHasCompanion] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    introspectToken(token).then((info) => {
      if (info.ok) setUnlocked(true);
    });
  }, []);

  if (!unlocked) {
    return <UnlockPage onUnlock={() => setUnlocked(true)} />;
  }

  if (!hasCompanion) {
    return <CompanionPage onReady={() => setHasCompanion(true)} />;
  }

  return <ReflectionsPage />;
}

export default App;

