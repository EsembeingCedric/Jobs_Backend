export function waLinkFor(phone, text = "Hello! I'm contacting you from TaskLink.") {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "#";
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function waLink(job) {
  return waLinkFor(
    job?.user?.phone,
    `Hello! I saw your job "${job?.title}" on TaskLink and I'm interested. Is it still available?`
  );
}
