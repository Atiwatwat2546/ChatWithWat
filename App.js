import { useEffect } from 'react';
import RootNavigator from "./src/navigation/RootNavigator";
import { setupNotifications } from "./src/notifications";

export default function App() {
  useEffect(() => {
    setupNotifications();
  }, []);

  return <RootNavigator />;
}
