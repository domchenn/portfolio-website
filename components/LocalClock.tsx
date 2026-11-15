"use client";

import { useSyncExternalStore } from "react";

const TIME_ZONE = "America/New_York";

const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
});

function subscribe(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}

/** Current Boston time, e.g. "3:42 PM". Renders nothing on the server so hydration matches. */
export default function LocalClock({ place = "Boston, USA" }: { place?: string }) {
  const time = useSyncExternalStore(
    subscribe,
    () => formatter.format(Date.now()),
    () => ""
  );

  return (
    <span className="text-[15px] text-label tabular-nums whitespace-nowrap">
      {place}
      {time && (
        <>
          {" · "}
          <time>{time}</time>
        </>
      )}
    </span>
  );
}
