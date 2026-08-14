export const categoryData = {
  Plumbing: { icon: "🔧", image: "/jobs/plumbing.jpg" },
  Cleaning: { icon: "🧹", image: "/jobs/cleaning.jpg" },
  Electrical: { icon: "⚡", image: "/jobs/electrical.jpg" },
  Tailoring: { icon: "✂️", image: "/jobs/tailoring.jpg" },
  Painting: { icon: "🎨", image: "/jobs/painting.jpg" },
  Gardening: { icon: "🌿", image: "/jobs/gardening.jpg" },
  Carpentry: { icon: "🪚", image: "/jobs/carpentry.jpg" },
  Moving: { icon: "📦", image: "/jobs/moving.jpg" },
  Tutoring: { icon: "📚", image: "/jobs/tutoring.jpg" },
  Cooking: { icon: "🍳", image: "/jobs/cooking.jpg" },
  "Web Development": { icon: "💻", image: "/jobs/webdev.jpg" },
  "Graphic Design": { icon: "🖌️", image: "/jobs/graphicdesign.jpg" },
  Hairdressing: { icon: "💇🏽", image: "/jobs/hairdressing.jpg" },
  Laundry: { icon: "👕", image: "/jobs/laundry.jpg" },
};

export const defaultCategory = { icon: "💼", image: "/jobs/plumbing.jpg" };

export const categoryColors = {
  Plumbing: "green",
  Cleaning: "accent",
  Electrical: "amber",
  Tailoring: "purple",
  Painting: "accent",
  Gardening: "green",
  Carpentry: "amber",
  Moving: "accent",
  Tutoring: "purple",
  Cooking: "amber",
  "Web Development": "accent",
  "Graphic Design": "purple",
  Hairdressing: "amber",
  Laundry: "accent",
};

export function categoryColor(category) {
  return categoryColors[category] || "green";
}

export function categoryIcon(category) {
  return categoryData[category]?.icon || defaultCategory.icon;
}

export function categoryImage(category) {
  return categoryData[category]?.image || defaultCategory.image;
}

export function jobImage(job) {
  if (job?.imageUrl) return job.imageUrl;
  return categoryImage(job?.category);
}
