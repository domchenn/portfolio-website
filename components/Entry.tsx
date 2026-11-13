import type { ReactNode } from "react";

export function ColumnHeading({ children }: { children: ReactNode }) {
  return <h2 className="m-0 text-[15px] font-normal text-label">{children}</h2>;
}

export function Entry({
  title,
  href,
  external = false,
  children,
}: {
  title: string;
  href?: string;
  external?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      {href ? <a href={href}>{title}</a> : <span>{title}</span>}
      {external && (
        <>
          {" "}
          <span aria-hidden="true" className="text-label">
            ↗
          </span>
        </>
      )}
      <p className="mt-0.5 mb-0 text-muted">{children}</p>
    </div>
  );
}
