import React, { CSSProperties, MutableRefObject, useRef, useState } from "react";

export default function Sidebar() {
  const sb: MutableRefObject<HTMLDivElement | null> = useRef(null);

  const [state, setState] = useState({ visible: false, transitioning: false });

  function buttonClicked() {
    if (sb.current instanceof HTMLDivElement) {
      setState({ visible: !state.visible, transitioning: true })
    }
  }

  function sidebarTransitioned() {
    setState({ visible: state.visible, transitioning: false })
  }

  const hiddenStyle: CSSProperties = {
    backgroundColor: "rgba(0, 0, 0, 0)",
    visibility: "hidden"
  }
  const transitioningStyle: CSSProperties = {
    backgroundColor: "rgba(0, 0, 0, 0)",
    visibility: "visible"
  }
  const visibleStyle: CSSProperties = {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    visibility: "visible"
  }
  return (
    <div>
      <div className="hamburger" style={{
        color: state.visible ? "rgb(100,100,100)" : "rgb(0,0,0)",
        visibility: "visible"
      }} onClick={buttonClicked} >
        {state.visible ? '⊠' : '≡'}
      </div>
      <div className="sidebar" style={(!state.visible) ? state.transitioning ? transitioningStyle : hiddenStyle : visibleStyle} onTransitionEnd={sidebarTransitioned} ref={sb} />
    </div>
  );
}
