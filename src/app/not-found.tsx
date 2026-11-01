import Link from "next/link";
import { T } from "@/features/card/T";

export default function NotFound() {
  return (
    <main className="lost">
      <svg className="lost__bloom" viewBox="-12 -12 24 24" aria-hidden="true">
        <g fill="currentColor">
          {[0, 72, 144, 216, 288].map((turn) => (
            <ellipse key={turn} cy="-6" rx="3.8" ry="5.8" transform={`rotate(${turn})`} />
          ))}
        </g>
        <circle r="3.2" fill="#ffd98a" />
      </svg>
      <p className="eyebrow">
        <T en="Page not found" vi="Không tìm thấy trang" />
      </p>
      <h1 className="section-title">
        <T
          en={
            <>
              This flower hasn&apos;t <em>bloomed</em> yet
            </>
          }
          vi={
            <>
              Bông hoa này chưa <em>nở</em>
            </>
          }
        />
      </h1>
      <Link className="btn btn--primary btn--lg" href="/">
        <T en="Back to the bouquet" vi="Về với bó hoa" />
      </Link>
    </main>
  );
}
