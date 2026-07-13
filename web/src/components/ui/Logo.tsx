export function Logo({ size = "sm" }: { size?: "sm" | "lg" }) {
  if (size === "lg") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/logo.png" alt="Swift" className="h-20 w-20 rounded-2xl" />
    );
  }

  return (
    <span className="block h-9 w-9 shrink-0 overflow-hidden rounded-lg">
      {/* Cropped to the icon glyph so it reads clearly at small sizes —
          the source image bakes the "Swift" wordmark in below the glyph. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Swift"
        className="h-full w-full object-cover"
        style={{ objectPosition: "center 10%" }}
      />
    </span>
  );
}
