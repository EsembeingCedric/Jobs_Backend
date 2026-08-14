import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { jobImageUrls } from "@/lib/job-images";

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const workerNames = [
  "Jean Kamga", "Marie Ndi", "Paul Mbarga", "Sophie Atanga", "Emmanuel Fokou",
  "Clarisse Abena", "Samuel Mbarga", "Grace Njie", "Daniel Fotso", "Cynthia Ngo",
  "Blaise Manga", "Nadia Etoa", "Patrick Ateba", "Estelle Mbappe", "Serge Nkodo",
  "Vanessa Ondoa", "Alain Tchoua", "Chantal Menga", "Herve Biya", "Martine Nlend",
  "Gaston Ebong", "Nicole Manga", "Rodrigue Fouda", "Aline Ngassa", "Cyrille Bello",
  "Brigitte Amougou", "Marcel Ekane", "Yvette Ndongo", "Leon Bissong", "Fabiola Kotto",
  "Bertrand Etoundi", "Sandrine Mevaa", "Arnaud Zogo", "Delphine Owona", "Hugues Nya",
  "Priscille Abanda", "Yannick Njock", "Raissa Balla", "Christian Mbala", "Solange Kembe",
  "Desire Owona", "Hermine Ekotto", "Olivier Nyemeck", "Julienne Mbida", "Marius Kenfack",
  "Christelle Atangana", "Landry Njeck", "Aurelie Essomba", "Frank Mbeutcha", "Patricia Tchekam",
];

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fresh = searchParams.get("fresh") === "1";

    const existingUsers = await prisma.user.count();
    if (existingUsers > 0 && !fresh) {
      return NextResponse.json({ message: "Database already seeded. Use ?fresh=1 to wipe and re-seed." });
    }

    if (fresh) {
      await prisma.statusComment.deleteMany();
      await prisma.statusLike.deleteMany();
      await prisma.status.deleteMany();
      await prisma.review.deleteMany();
      await prisma.message.deleteMany();
      await prisma.job.deleteMany();
      await prisma.user.deleteMany();
    }

    const pw = hashPassword("password123");

    const users = [];
    for (let i = 0; i < workerNames.length; i++) {
      const name = workerNames[i];
      const email = name.toLowerCase().replace(/[^a-z0-9]/g, "") + "@tasklink.com";
      const city = ["Douala", "Yaounde", "Bafoussam", "Garoua", "Bamenda", "Limbe", "Buea", "Kribi"][i % 8];
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: pw,
          phone: `+237 6${String((i % 8) + 1)}0 ${String(100000 + i)}`,
          bio: `Skilled ${["professional", "artisan", "specialist", "expert", "technician", "craftsperson"][i % 6]} based in ${city}, offering reliable services across the region.`,
        },
      });
      users.push(user);
    }

    const categories = [
      "Plumbing", "Cleaning", "Electrical", "Tailoring", "Painting",
      "Gardening", "Carpentry", "Moving", "Tutoring", "Cooking",
      "Web Development", "Graphic Design",
    ];

    const locations = [
      "Douala, Bonamoussadi", "Douala, Akwa", "Douala, Bonanjo", "Douala, Bonapriso",
      "Douala, Makepe", "Douala, Deido", "Douala, Bepanda", "Douala, Ndokoti",
      "Yaounde, Bastos", "Yaounde, Mvan", "Yaounde, Nkolbisson", "Yaounde, Mokolo",
      "Yaounde, Etoudi", "Yaounde, Biyem-Assi", "Yaounde, Obili", "Yaounde, Messa",
      "Bafoussam, Banengo", "Bafoussam, Djeleng", "Garoua, Roumde-Adja", "Bamenda, Up Station",
      "Kribi, Cite", "Limbe, Bota", "Buea, Molyko", "Ngaoundere, Baladji",
    ];

    const jobTemplates = [
      { t: "Plumbing Repair - {loc}", d: "Fix leaking pipes and replace fittings in bathroom", cat: "Plumbing", p: 15000 },
      { t: "Emergency Plumbing - {loc}", d: "Urgent repair of burst pipe and water damage cleanup", cat: "Plumbing", p: 25000 },
      { t: "Toilet Installation - {loc}", d: "Install new toilet including removal of old fixture", cat: "Plumbing", p: 20000 },
      { t: "Water Heater Repair - {loc}", d: "Troubleshoot and repair electric water heater", cat: "Plumbing", p: 18000 },
      { t: "Drain Unclogging - {loc}", d: "Unclog kitchen sink and bathroom drains", cat: "Plumbing", p: 8000 },
      { t: "Shower Installation - {loc}", d: "Install new shower head, faucet, and drain", cat: "Plumbing", p: 22000 },
      { t: "Outdoor Tap Repair - {loc}", d: "Replace outdoor water tap and fix garden hose connection", cat: "Plumbing", p: 7000 },
      { t: "Pipe Replacement - {loc}", d: "Replace old galvanized pipes with modern PVC", cat: "Plumbing", p: 35000 },
      { t: "Bathroom Renovation - {loc}", d: "Full bathroom renovation including plumbing fixtures", cat: "Plumbing", p: 120000 },
      { t: "Water Pressure Fix - {loc}", d: "Diagnose and fix low water pressure in entire apartment", cat: "Plumbing", p: 12000 },
      { t: "Deep House Cleaning - {loc}", d: "Complete deep cleaning of 3-bedroom house", cat: "Cleaning", p: 10000 },
      { t: "Office Cleaning - {loc}", d: "Weekly office cleaning for small business", cat: "Cleaning", p: 15000 },
      { t: "Carpet Cleaning - {loc}", d: "Professional carpet shampooing and stain removal", cat: "Cleaning", p: 12000 },
      { t: "Move-Out Cleaning - {loc}", d: "Thorough cleaning of apartment before move-out", cat: "Cleaning", p: 18000 },
      { t: "Kitchen Deep Clean - {loc}", d: "Deep clean kitchen including oven, fridge, and cabinets", cat: "Cleaning", p: 12000 },
      { t: "Window Cleaning - {loc}", d: "Clean all windows inside and out for 3-story building", cat: "Cleaning", p: 20000 },
      { t: "Post-Construction Cleaning - {loc}", d: "Remove construction dust and debris from new renovation", cat: "Cleaning", p: 25000 },
      { t: "Sofa Cleaning - {loc}", d: "Professional upholstery cleaning for 5-seater sofa", cat: "Cleaning", p: 8000 },
      { t: "Bathroom Scrubbing - {loc}", d: "Intensive bathroom scrubbing including tiles and grout", cat: "Cleaning", p: 7000 },
      { t: "Laundry Service - {loc}", d: "Pickup, wash, dry, fold, and deliver laundry", cat: "Cleaning", p: 5000 },
      { t: "Ceiling Fan Installation - {loc}", d: "Install new ceiling fan with remote control", cat: "Electrical", p: 12000 },
      { t: "Light Fixture Replacement - {loc}", d: "Replace old light fixtures with modern LED", cat: "Electrical", p: 8000 },
      { t: "Full House Wiring - {loc}", d: "Complete electrical wiring for new house construction", cat: "Electrical", p: 150000 },
      { t: "Circuit Breaker Repair - {loc}", d: "Replace faulty circuit breaker and fix electrical panel", cat: "Electrical", p: 15000 },
      { t: "Outlet Installation - {loc}", d: "Install new power outlets in living room", cat: "Electrical", p: 6000 },
      { t: "Generator Connection - {loc}", d: "Install transfer switch and connect generator to house", cat: "Electrical", p: 45000 },
      { t: "Security Light Installation - {loc}", d: "Install motion sensor security lights outside", cat: "Electrical", p: 10000 },
      { t: "Electric Cooker Wiring - {loc}", d: "Wiring for new electric cooker/hob", cat: "Electrical", p: 12000 },
      { t: "Doorbell Installation - {loc}", d: "Install video doorbell system", cat: "Electrical", p: 9000 },
      { t: "Solar Panel Setup - {loc}", d: "Install small solar panel system for backup power", cat: "Electrical", p: 80000 },
      { t: "Custom Dress Making - {loc}", d: "Create custom dress from fabric provided by client", cat: "Tailoring", p: 25000 },
      { t: "Suit Alteration - {loc}", d: "Alter men's suit including jacket sleeves and pants hem", cat: "Tailoring", p: 8000 },
      { t: "Traditional Outfit - {loc}", d: "Sew traditional outfit for special occasion", cat: "Tailoring", p: 20000 },
      { t: "Curtain Making - {loc}", d: "Custom curtains for living room including lining", cat: "Tailoring", p: 15000 },
      { t: "Uniform Sewing - {loc}", d: "Sew school or work uniforms in bulk", cat: "Tailoring", p: 5000 },
      { t: "Wedding Gown - {loc}", d: "Custom wedding gown design and creation", cat: "Tailoring", p: 100000 },
      { t: "Babies Clothing - {loc}", d: "Set of baby clothes including onesies and pajamas", cat: "Tailoring", p: 8000 },
      { t: "Bag Repair - {loc}", d: "Repair torn bag and replace zipper", cat: "Tailoring", p: 5000 },
      { t: "Embroidery Work - {loc}", d: "Custom embroidery on shirts and fabrics", cat: "Tailoring", p: 7000 },
      { t: "Lingerie Set - {loc}", d: "Custom lingerie set design and sewing", cat: "Tailoring", p: 12000 },
      { t: "Living Room Painting - {loc}", d: "Paint living room walls with premium paint", cat: "Painting", p: 30000 },
      { t: "Bedroom Painting - {loc}", d: "Paint bedroom including ceiling and trim", cat: "Painting", p: 20000 },
      { t: "Exterior House Painting - {loc}", d: "Paint exterior walls of a 3-bedroom house", cat: "Painting", p: 80000 },
      { t: "Fence Painting - {loc}", d: "Paint metal gate and surrounding fence", cat: "Painting", p: 15000 },
      { t: "Wall Art Mural - {loc}", d: "Create custom mural painting on feature wall", cat: "Painting", p: 50000 },
      { t: "Kitchen Cabinet Painting - {loc}", d: "Paint kitchen cabinets with durable finish", cat: "Painting", p: 25000 },
      { t: "Ceiling Painting - {loc}", d: "Paint ceiling in living and dining area", cat: "Painting", p: 18000 },
      { t: "Furniture Painting - {loc}", d: "Refurbish old furniture with fresh paint", cat: "Painting", p: 12000 },
      { t: "Gate Painting - {loc}", d: "Paint wrought iron gate and railings", cat: "Painting", p: 12000 },
      { t: "Waterproofing Paint - {loc}", d: "Apply waterproof paint to exterior wall", cat: "Painting", p: 22000 },
      { t: "Lawn Mowing - {loc}", d: "Regular lawn mowing and edging services", cat: "Gardening", p: 5000 },
      { t: "Hedge Trimming - {loc}", d: "Trim and shape hedge around property", cat: "Gardening", p: 8000 },
      { t: "Garden Design - {loc}", d: "Design and plant new garden with flowers and shrubs", cat: "Gardening", p: 35000 },
      { t: "Tree Pruning - {loc}", d: "Prune large tree branches for safety and health", cat: "Gardening", p: 15000 },
      { t: "Weed Removal - {loc}", d: "Remove weeds from garden beds and pathways", cat: "Gardening", p: 6000 },
      { t: "Flower Planting - {loc}", d: "Plant seasonal flowers in garden beds", cat: "Gardening", p: 10000 },
      { t: "Irrigation Installation - {loc}", d: "Install drip irrigation system for garden", cat: "Gardening", p: 20000 },
      { t: "Pest Control - {loc}", d: "Natural pest control treatment for garden", cat: "Gardening", p: 12000 },
      { t: "Compost Setup - {loc}", d: "Build and install compost bin for kitchen waste", cat: "Gardening", p: 8000 },
      { t: "Vertical Garden - {loc}", d: "Install vertical garden wall with native plants", cat: "Gardening", p: 30000 },
      { t: "Custom Bookshelf - {loc}", d: "Build custom built-in bookshelf with lighting", cat: "Carpentry", p: 45000 },
      { t: "Door Repair - {loc}", d: "Fix sticking door and replace hinges", cat: "Carpentry", p: 8000 },
      { t: "Kitchen Cabinet Installation - {loc}", d: "Install modular kitchen cabinets", cat: "Carpentry", p: 50000 },
      { t: "Wooden Deck - {loc}", d: "Build wooden deck with railing in backyard", cat: "Carpentry", p: 80000 },
      { t: "Window Frame Replacement - {loc}", d: "Replace old wooden window frames with new ones", cat: "Carpentry", p: 25000 },
      { t: "Bed Frame Building - {loc}", d: "Build custom king-size bed frame with storage", cat: "Carpentry", p: 35000 },
      { t: "Table and Chairs - {loc}", d: "Build dining table set for 6 people", cat: "Carpentry", p: 60000 },
      { t: "Wardrobe Installation - {loc}", d: "Install fitted wardrobe with sliding doors", cat: "Carpentry", p: 55000 },
      { t: "Fence Repair - {loc}", d: "Repair broken fence panels and posts", cat: "Carpentry", p: 15000 },
      { t: "Staircase Handrail - {loc}", d: "Install wooden handrail for staircase", cat: "Carpentry", p: 20000 },
      { t: "Piano Moving - {loc}", d: "Carefully move upright piano to new location", cat: "Moving", p: 30000 },
      { t: "Apartment Relocation - {loc}", d: "Full moving service for 2-bedroom apartment", cat: "Moving", p: 50000 },
      { t: "Furniture Transport - {loc}", d: "Transport large furniture across town", cat: "Moving", p: 15000 },
      { t: "Packing Service - {loc}", d: "Professional packing of household items", cat: "Moving", p: 20000 },
      { t: "Office Relocation - {loc}", d: "Move office furniture and equipment", cat: "Moving", p: 80000 },
      { t: "Delivery Service - {loc}", d: "Deliver large item from store to home", cat: "Moving", p: 8000 },
      { t: "Storage Loading - {loc}", d: "Load and unload storage unit items", cat: "Moving", p: 12000 },
      { t: "Vehicle Transport - {loc}", d: "Transport vehicle from one city to another", cat: "Moving", p: 60000 },
      { t: "Appliance Moving - {loc}", d: "Move fridge, washing machine, and stove safely", cat: "Moving", p: 10000 },
      { t: "Waste Removal - {loc}", d: "Remove construction waste and old furniture", cat: "Moving", p: 15000 },
      { t: "Math Tutoring - {loc}", d: "Private math tutoring for high school students", cat: "Tutoring", p: 3000 },
      { t: "English Lessons - {loc}", d: "Conversational English practice sessions", cat: "Tutoring", p: 2500 },
      { t: "Physics Tutoring - {loc}", d: "Physics tutoring for secondary school", cat: "Tutoring", p: 3500 },
      { t: "French Tutoring - {loc}", d: "French language tutoring for beginners to advanced", cat: "Tutoring", p: 3000 },
      { t: "Music Lessons - {loc}", d: "Guitar or piano lessons for beginners", cat: "Tutoring", p: 5000 },
      { t: "Computer Skills - {loc}", d: "Basic computer literacy and office software training", cat: "Tutoring", p: 4000 },
      { t: "Programming Tutoring - {loc}", d: "Learn Python or JavaScript programming basics", cat: "Tutoring", p: 7000 },
      { t: "Accounting Tutoring - {loc}", d: "Learn basic accounting principles and bookkeeping", cat: "Tutoring", p: 4000 },
      { t: "Test Prep - {loc}", d: "Prepare for entrance exams and certifications", cat: "Tutoring", p: 6000 },
      { t: "Art Classes - {loc}", d: "Drawing and painting classes for all ages", cat: "Tutoring", p: 5000 },
      { t: "Event Catering - {loc}", d: "Full catering service for birthday party (50 guests)", cat: "Cooking", p: 60000 },
      { t: "Personal Chef - {loc}", d: "Private chef for a week of healthy meal prep", cat: "Cooking", p: 40000 },
      { t: "Baking Class - {loc}", d: "Learn to bake bread, cakes, and pastries", cat: "Cooking", p: 8000 },
      { t: "Meal Prep Service - {loc}", d: "Weekly meal prep with healthy balanced meals", cat: "Cooking", p: 15000 },
      { t: "Traditional Dish Cooking - {loc}", d: "Prepare traditional dishes for family gathering", cat: "Cooking", p: 20000 },
      { t: "Cake Decorating - {loc}", d: "Custom cake design and decoration for events", cat: "Cooking", p: 12000 },
      { t: "Barbecue Service - {loc}", d: "Full barbecue catering for outdoor party", cat: "Cooking", p: 30000 },
      { t: "Snack Preparation - {loc}", d: "Prepare assorted snacks and small chops for event", cat: "Cooking", p: 10000 },
      { t: "Juice and Smoothie Bar - {loc}", d: "Fresh juice and smoothie service for events", cat: "Cooking", p: 15000 },
      { t: "Diet Meal Plan - {loc}", d: "Custom meal plan and preparation for weight loss", cat: "Cooking", p: 20000 },
      { t: "Build Business Website - {loc}", d: "Build a professional multi-page business website with contact form", cat: "Web Development", p: 150000 },
      { t: "E-commerce Store - {loc}", d: "Set up an online store with product pages and payment gateway", cat: "Web Development", p: 200000 },
      { t: "Portfolio Website - {loc}", d: "Design and build a personal portfolio website", cat: "Web Development", p: 80000 },
      { t: "Landing Page - {loc}", d: "Create a high-converting landing page for a new product", cat: "Web Development", p: 60000 },
      { t: "Restaurant Website - {loc}", d: "Build a restaurant website with menu and reservations", cat: "Web Development", p: 120000 },
      { t: "School Website - {loc}", d: "Develop a school website with news, staff and admissions pages", cat: "Web Development", p: 130000 },
      { t: "Website Redesign - {loc}", d: "Redesign an outdated website with modern UI/UX", cat: "Web Development", p: 100000 },
      { t: "Booking System Web App - {loc}", d: "Build a web app for booking appointments and managing schedules", cat: "Web Development", p: 250000 },
      { t: "Blog Setup - {loc}", d: "Set up a blog with SEO, analytics and newsletter", cat: "Web Development", p: 50000 },
      { t: "SEO Optimization - {loc}", d: "Optimize website for search engines and improve page speed", cat: "Web Development", p: 70000 },
      { t: "Birthday Flyer Design - {loc}", d: "Design an eye-catching birthday party flyer", cat: "Graphic Design", p: 5000 },
      { t: "Wedding Flyer Design - {loc}", d: "Design elegant wedding flyer and program cards", cat: "Graphic Design", p: 8000 },
      { t: "Logo Design - {loc}", d: "Create a unique logo for a new business", cat: "Graphic Design", p: 15000 },
      { t: "Business Card Design - {loc}", d: "Design professional business cards for a company", cat: "Graphic Design", p: 7000 },
      { t: "Restaurant Menu Design - {loc}", d: "Design an attractive menu with photos and pricing", cat: "Graphic Design", p: 12000 },
      { t: "Social Media Posts - {loc}", d: "Design a set of branded social media posts", cat: "Graphic Design", p: 10000 },
      { t: "Ad Banner Design - {loc}", d: "Design promotional banners for print and online ads", cat: "Graphic Design", p: 9000 },
      { t: "Poster Design - {loc}", d: "Design event poster for concert or campaign", cat: "Graphic Design", p: 8000 },
      { t: "Wedding Invitation Card - {loc}", d: "Design and layout wedding invitation cards", cat: "Graphic Design", p: 10000 },
      { t: "T-Shirt Design - {loc}", d: "Create a custom t-shirt design with artwork", cat: "Graphic Design", p: 8000 },
    ];

    const userIds = users.map((u) => u.id);

    const jobsData = jobTemplates.map((job, i) => {
      const loc = locations[i % locations.length];
      const user = userIds[i % userIds.length];
      return {
        title: job.t.replace("{loc}", loc.split(",")[0].trim()),
        description: job.d,
        details: `This job requires attention to detail and professionalism. Contact for more information about scheduling and pricing.`,
        price: job.p,
        location: loc,
        category: job.cat,
        imageUrl: jobImageUrls[i] || null,
        userId: user,
        rating: i < 20 ? (i % 5) + 1 : 0,
        ratingCount: i < 20 ? 2 : 0,
      };
    });

    await prisma.job.createMany({ data: jobsData });

    const jobs = await prisma.job.findMany({ orderBy: { id: "asc" } });

    await prisma.review.createMany({
      data: [
        { rating: 5, comment: "Excellent work! Very professional and fast.", reviewerId: users[1].id, revieweeId: users[0].id, jobId: jobs[0].id },
        { rating: 4, comment: "Good job, would recommend.", reviewerId: users[2].id, revieweeId: users[0].id, jobId: jobs[0].id },
        { rating: 5, comment: "My house has never been this clean!", reviewerId: users[0].id, revieweeId: users[1].id, jobId: jobs[10].id },
        { rating: 5, comment: "Perfect job, very thorough.", reviewerId: users[3].id, revieweeId: users[1].id, jobId: jobs[10].id },
        { rating: 4, comment: "Very skilled electrician. Work completed on time.", reviewerId: users[0].id, revieweeId: users[2].id, jobId: jobs[20].id },
        { rating: 5, comment: "Absolutely stunning dress! Exactly what I wanted.", reviewerId: users[0].id, revieweeId: users[3].id, jobId: jobs[30].id },
        { rating: 5, comment: "Best seamstress in Douala!", reviewerId: users[1].id, revieweeId: users[3].id, jobId: jobs[30].id },
        { rating: 5, comment: "Beautiful website, exactly as we imagined.", reviewerId: users[0].id, revieweeId: users[4].id, jobId: jobs[100].id },
        { rating: 4, comment: "Great designer, delivered the flyers on time.", reviewerId: users[1].id, revieweeId: users[5].id, jobId: jobs[110].id },
        { rating: 5, comment: "Amazing logo design. Highly recommended.", reviewerId: users[2].id, revieweeId: users[5].id, jobId: jobs[112].id },
      ],
    });

    await prisma.message.createMany({
      data: [
        { text: "Hi! I saw your plumbing job posting. I can help with that.", senderId: users[2].id, receiverId: users[0].id },
        { text: "Great! When are you available?", senderId: users[0].id, receiverId: users[2].id },
        { text: "I can come by tomorrow morning, around 9am.", senderId: users[2].id, receiverId: users[0].id },
        { text: "That works for me. See you then!", senderId: users[0].id, receiverId: users[2].id },
        { text: "Hello, I'm interested in the cleaning job.", senderId: users[0].id, receiverId: users[1].id },
        { text: "Hi! Sure, when would you like to start?", senderId: users[1].id, receiverId: users[0].id },
      ],
    });

    const status1 = await prisma.status.create({
      data: { content: "Just finished a major plumbing job in Bonamoussadi. Customer was very happy with the work! Another satisfied client. 💪", userId: users[0].id },
    });
    const status2 = await prisma.status.create({
      data: { content: "Looking for new cleaning clients this week. Special discount for first-time customers. PM me for details!", userId: users[1].id },
    });
    const status3 = await prisma.status.create({
      data: { content: "Just got certified in modern electrical safety standards. Now offering electrical inspections at reduced rates for the first 10 clients.", userId: users[2].id },
    });
    const status4 = await prisma.status.create({
      data: { content: "New fabric collection arrived! Come by the workshop to see the latest Ankara and lace designs for this season.", userId: users[3].id },
    });
    const status5 = await prisma.status.create({
      data: { content: "I now build modern websites and design flyers. Special launch offer on portfolio sites and birthday flyers!", userId: users[4].id },
    });

    await prisma.statusLike.createMany({
      data: [
        { userId: users[1].id, statusId: status1.id },
        { userId: users[2].id, statusId: status1.id },
        { userId: users[3].id, statusId: status1.id },
        { userId: users[0].id, statusId: status2.id },
        { userId: users[2].id, statusId: status2.id },
        { userId: users[0].id, statusId: status3.id },
        { userId: users[1].id, statusId: status3.id },
        { userId: users[3].id, statusId: status3.id },
        { userId: users[0].id, statusId: status4.id },
        { userId: users[1].id, statusId: status4.id },
        { userId: users[2].id, statusId: status5.id },
        { userId: users[3].id, statusId: status5.id },
      ],
    });

    await prisma.statusComment.createMany({
      data: [
        { content: "Great work Jean! Keep it up!", userId: users[1].id, statusId: status1.id },
        { content: "Thanks Marie! Appreciate it.", userId: users[0].id, statusId: status1.id },
        { content: "I'm interested! Sending you a message.", userId: users[0].id, statusId: status2.id },
        { content: "That's awesome Paul. Very important for safety.", userId: users[0].id, statusId: status3.id },
        { content: "Where is your workshop located?", userId: users[1].id, statusId: status4.id },
        { content: "I need a birthday flyer this weekend. PM me!", userId: users[3].id, statusId: status5.id },
      ],
    });

    return NextResponse.json({ message: `Database seeded with ${users.length} users, ${jobsData.length} jobs, reviews, messages, statuses, likes and comments!` });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
