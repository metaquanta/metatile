import React, { MutableRefObject, useRef } from "react";

export default function Sidebar() {
  const hb: MutableRefObject<HTMLDivElement | null> = useRef(null);

  return (
    <div>
      <div className="hamburger" ref={hb}>
        ☰
      </div>
      <div className="sidebar" />
    </div>
  );
}
