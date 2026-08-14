import { createHash } from "crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const url = process.env.DATABASE_URL || "mysql://root@localhost:3306/tasklink";
const database = (url.split("?")[0].split("/").pop()) || "tasklink";
const adapter = new PrismaMariaDb(url, { database, useTextProtocol: true });
const prisma = new PrismaClient({ adapter });

const KEEP_JOB_ID = 342;

const pw = createHash("sha256").update("password123").digest("hex");

const workers = [
  {
    name: "Gabichou Nkong",
    email: "gabichou.styling@tasklink.cm",
    phone: "+237 640 27 60 45",
    avatar: "/uploads/avatar-hair.jpg",
    bio: "Professional hairdresser and stylist based in Yaounde, offering modern braids, weaving and salon styling.",
    job: {
      title: "Gabichou's styling",
      description: "Hair styling and salon services for men and women. Braids, weaving, trimming and modern cuts.",
      details: "Walk-in appointments welcome. Prices depend on the style. Message on WhatsApp for bookings and home-service options.",
      price: 5000,
      category: "Hairdressing",
      imageUrl: "/uploads/job-hair.jpg",
    },
  },
  {
    name: "Christel Abanda",
    email: "christel.graphics@tasklink.cm",
    phone: "+237 651 65 96 27",
    avatar: "/uploads/avatar-design.jpg",
    bio: "Creative graphic designer specialising in flyers, posters and branding for events and businesses.",
    job: {
      title: "Graphics Designer",
      description: "Professional flyer, poster and social media graphic design for events, birthdays, weddings and businesses.",
      details: "Fast delivery, unlimited revisions until you are satisfied. Share your event details on WhatsApp to get a quote.",
      price: 10000,
      category: "Graphic Design",
      imageUrl: "/uploads/job-design.jpg",
    },
  },
  {
    name: "Marthe Ngo Bakwa",
    email: "marthe.cleaning@tasklink.cm",
    phone: "+237 676 55 83 67",
    avatar: "/uploads/avatar-clean.jpg",
    bio: "Reliable house cleaning professional in Yaounde. Trusted, careful and thorough.",
    job: {
      title: "House Cleaning Services",
      description: "Complete house cleaning: floors, kitchen, bathrooms and general tidying. Weekly or one-off deep cleaning.",
      details: "I bring all cleaning products. Contact me on WhatsApp to plan a visit and get a free estimate.",
      price: 12000,
      category: "Cleaning",
      imageUrl: "/uploads/job-clean.jpg",
    },
  },
  {
    name: "Esther Mbarga",
    email: "esther.laundry@tasklink.cm",
    phone: "+237 652 55 29 16",
    avatar: "/uploads/avatar-laundry.jpg",
    bio: "Careful hand and machine laundry specialist. Your clothes handled gently and returned spotless.",
    job: {
      title: "Dress Washing Service",
      description: "Hand and machine washing of dresses and clothing, with proper care for delicate fabrics.",
      details: "Pickup and delivery available within Yaounde. Message on WhatsApp to arrange collection and pricing.",
      price: 3000,
      category: "Laundry",
      imageUrl: "/uploads/job-laundry.jpg",
    },
  },
  {
    name: "Serge Manga",
    email: "serge.webdev@tasklink.cm",
    phone: "+237 651 65 01 73",
    avatar: "/uploads/avatar-webdev1.jpg",
    bio: "Web developer building modern, fast websites for businesses, schools and individuals.",
    job: {
      title: "Web Development Services",
      description: "Build a professional website or web application: business sites, portfolios, landing pages and more.",
      details: "Modern, mobile-friendly and SEO-ready builds. Contact me on WhatsApp to discuss your project.",
      price: 150000,
      category: "Web Development",
      imageUrl: "/uploads/job-webdev1.jpg",
    },
  },
  {
    name: "Alchemy Codes Service",
    email: "alchemy.codes@tasklink.cm",
    phone: "+237 679 40 35 30",
    avatar: "/uploads/avatar-webdev2.jpg",
    bio: "Alchemy Codes Service — a team of developers crafting e-commerce stores, booking systems and custom web apps.",
    job: {
      title: "Alchemy Codes Service",
      description: "Full-stack web development agency: e-commerce stores, booking systems and custom business web applications.",
      details: "End-to-end development from design to deployment, with support after launch. Contact us on WhatsApp for a free consultation.",
      price: 200000,
      category: "Web Development",
      imageUrl: "/uploads/job-webdev2.jpg",
    },
  },
];

async function main() {
  await prisma.message.deleteMany({ where: { jobId: { not: KEEP_JOB_ID } } });
  await prisma.review.deleteMany({ where: { jobId: { not: KEEP_JOB_ID } } });
  const deleted = await prisma.job.deleteMany({ where: { id: { not: KEEP_JOB_ID } } });
  console.log(`Deleted ${deleted.count} jobs (kept job ${KEEP_JOB_ID})`);

  const created = [];
  for (const w of workers) {
    const user = await prisma.user.upsert({
      where: { email: w.email },
      update: { name: w.name, phone: w.phone, avatar: w.avatar, bio: w.bio },
      create: {
        name: w.name,
        email: w.email,
        password: pw,
        phone: w.phone,
        avatar: w.avatar,
        bio: w.bio,
      },
    });
    const job = await prisma.job.create({
      data: {
        ...w.job,
        location: "Yaounde, Cameroon",
        rating: 5,
        ratingCount: 1,
        userId: user.id,
      },
    });
    created.push({ user: user.name, jobId: job.id, title: job.title });
  }

  const jobs = await prisma.job.findMany({ orderBy: { createdAt: "desc" } });
  console.log(`Total jobs in DB: ${jobs.length} (job 342 kept: ${jobs.some((j) => j.id === KEEP_JOB_ID)})`);
  for (const j of jobs) console.log(`  #${j.id} ${j.title} | ${j.category} | ${j.user?.name} | ${j.user?.phone}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
