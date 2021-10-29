import React from "react";
import { useLocalStorage } from "use-storage/src/index";

export const App: React.FunctionComponent = () => {
  const [state, setState] = useLocalStorage("state", {
    count: 0,
  });
  const [state2, setState2] = useLocalStorage("state", {
    count: 0,
  });

  return (
    <div>
      First count is {state.count}
      <button onClick={() => setState({ count: (state.count) + 1 })}>
        Click me
      </button>
      Second count is {state2.count}
      <button onClick={() => setState2({ count: (state2.count) + 1 })}>
        Click me
      </button>
    </div>
  );
}

export default App;
