import React from "react";

export default function AppLoader({ label = "Loading" }) {
  return (
    <div className="app-loader" role="status" aria-live="polite" aria-label={label}>
      <div className="app-loader__card">
        <div className="app-loader__top">
          <div className="app-loader__spinner" aria-hidden />
          <div className="app-loader__title">{label}…</div>
        </div>
        <div className="app-loader__body">
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" style={{ width: "88%" }} />
          <div className="skeleton skeleton-line" style={{ width: "72%" }} />
          <div className="app-loader__grid">
            <div className="skeleton skeleton-tile" />
            <div className="skeleton skeleton-tile" />
            <div className="skeleton skeleton-tile" />
            <div className="skeleton skeleton-tile" />
          </div>
        </div>
      </div>
    </div>
  );
}
