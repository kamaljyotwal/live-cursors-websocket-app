import React from "react";
import useWebSocket from "react-use-websocket";
import throttle from "lodash.throttle";
import { Cursor } from "./components/Cursor";

export default function Home({ username }) {
  const WS_URL = "ws://127.0.0.1:8000";

  const renderCursors = (users) => {
    return Object.keys(users).map((uuid) => {
      const user = users[uuid];
      return <Cursor key={uuid} point={[user.state.x, user.state.y]} />;
    });
  };
  const renderUsersList = (users) => {
    return Object.keys(users).map((uuid) => {
      return <li key={uuid}>{JSON.stringify(users[uuid])}</li>;
    });
  };

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
    queryParams: { username },
  });
  const THROTTLETIME = 20;
  const sendJsonMessageThrottled = React.useRef(throttle(sendJsonMessage, THROTTLETIME));

  React.useEffect(() => {
    sendJsonMessage({ x: 0, y: 0 });
    window.addEventListener("mousemove", (e) => {
      sendJsonMessageThrottled.current({
        x: e.clientX,
        y: e.clientY,
      });
    });
  }, []);

  if (lastJsonMessage) {
    return (
      <>
        {renderUsersList(lastJsonMessage)}
        {renderCursors(lastJsonMessage)}
      </>
    );
  }

  return <h1>hello, {username}</h1>;
}
