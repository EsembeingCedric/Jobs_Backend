"use client";

export default function StarRating({ value = 0, onChange, size = "md", readonly = false }) {
  const sizes = { sm: "0.9rem", md: "1.2rem", lg: "1.5rem" };
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`stars ${readonly ? "stars-readonly" : ""}`} style={{ fontSize: sizes[size] }}>
      {stars.map((s) => (
        <span
          key={s}
          className={`star ${s <= value ? "filled" : ""}`}
          onClick={() => !readonly && onChange && onChange(s)}
          role={readonly ? "img" : "button"}
          aria-label={`${s} star${s > 1 ? "s" : ""}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
