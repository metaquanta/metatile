import React, {
  ChangeEvent,
  CSSProperties,
  MutableRefObject,
  useRef,
  useState,
} from "react";

export default function Sidebar(props: {
  tilings: string[];
  setTiling: (n: number) => void;
  selectedTiling: number;
}) {
  const sb: MutableRefObject<HTMLDivElement | null> = useRef(null);

  function tilingSelected(event: ChangeEvent<HTMLSelectElement>) {
    props.setTiling(Number.parseInt(event.target.value));
  }

  const [state, setState] = useState({ visible: false, transitioning: false });

  function buttonClicked() {
    if (sb.current instanceof HTMLDivElement) {
      setState({ visible: !state.visible, transitioning: true });
    }
  }

  function sidebarTransitioned() {
    setState({ visible: state.visible, transitioning: false });
  }

  const hiddenStyle: CSSProperties = {
    backgroundColor: "rgba(0, 0, 0, 0)",
    visibility: "hidden",
  };
  const transitioningStyle: CSSProperties = {
    backgroundColor: "rgba(0, 0, 0, 0)",
    visibility: "visible",
  };
  const visibleStyle: CSSProperties = {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    visibility: "visible",
  };
  return (
    <div>
      <div
        className="hamburger"
        style={{
          color: state.visible ? "rgb(100,100,100)" : "rgb(0,0,0)",
          visibility: "visible",
        }}
        onClick={buttonClicked}
      >
        {state.visible ? "⊠" : "≡"}
      </div>
      <div
        className="sidebar"
        style={
          !state.visible
            ? state.transitioning
              ? transitioningStyle
              : hiddenStyle
            : visibleStyle
        }
        onTransitionEnd={sidebarTransitioned}
        ref={sb}
      >
        <form>
          <select name="tiling" onChange={tilingSelected}>
            {props.tilings.map((v, i) => (
              <option selected={i === props.selectedTiling} value={i}>
                {v}
              </option>
            ))}
          </select>
        </form>
      </div>
    </div>
  );
}
