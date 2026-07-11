import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeUsers, products } from './config/dataStore.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // For development, allow any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const initialProducts = [
  {
    id: "1",
    title: "LUMISTYLE 'AURA' Premium Obsidian Trench Coat",
    price: 249.99,
    description: "An avant-garde long trench coat crafted from a water-resistant technical cotton blend. Featuring architectural lapels, deep utility pockets, and a matte black magnetic belt clasp. Styled for absolute luxury and seamless design system compliance.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600",
    rating: { rate: 4.9, count: 48 },
    stock: 20
  },
  {
    id: "2",
    title: "LUMISTYLE 'NOVA' Electric Pink Knit Crop Top",
    price: 89.99,
    description: "A vibrant cropped knitwear piece crafted from organic mercerized cotton. Featuring ribbed cuffs, an athletic racerback design, and subtle electric purple accents around the seams. Perfect for energetic everyday styling.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600",
    rating: { rate: 4.8, count: 62 },
    stock: 35
  },
  {
    id: "3",
    title: "LUMISTYLE 'KRONOS' Smart Sleek Audio Sunglasses",
    price: 179.99,
    description: "Tech-fashion at its peak. Polarized UV400 lenses housed in a lightweight matte black titanium frame. Equipped with open-ear dual speaker micro-drivers, Bluetooth 5.2 connectivity, and touch-sensitive temples for intuitive music controls.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600",
    rating: { rate: 4.7, count: 34 },
    stock: 15
  },
  {
    id: "4",
    title: "LUMISTYLE 'VORTEX' Gold Chain Crescent Pendant",
    price: 129.99,
    description: "A stunning minimalist jewelry item cast in solid sterling silver and plated in 18k yellow gold. Featuring a micro-set cubic zirconia crescent moon centerpiece suspended on a delicate 45cm adjustable box chain.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600",
    rating: { rate: 4.9, count: 75 },
    stock: 25
  },
  {
    id: "5",
    title: "LUMISTYLE 'NOIR' Luxury Leather Chelsea Boots",
    price: 189.99,
    description: "Handcrafted in Italy from full-grain calfskin leather. Fitted with flexible elastic side panels, a premium leather lining, and a durable stacked heel. Sleek, minimalist, and built for ultimate comfort.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600",
    rating: { rate: 4.8, count: 52 },
    stock: 18
  },
  {
    id: "6",
    title: "LUMISTYLE 'VALENCE' Cropped Obsidian Puffer Jacket",
    price: 219.99,
    description: "A high-gloss cropped puffer jacket insulated with premium down fill. Designed with a high funnel collar, water-resistant zippers, and adjustable elastic drawcords at the waist hem.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600",
    rating: { rate: 4.9, count: 41 },
    stock: 12
  },
  {
    id: "7",
    title: "LUMISTYLE 'ECLIPSE' Active Hybrid Sport Earbuds",
    price: 149.99,
    description: "Next-generation active noise-canceling earbuds. Featuring custom-tuned 11mm drivers, IPX7 sweatproof resistance, and an ergonomic secure-fit earhook. Delivers deep, resonant sound for up to 30 hours.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600",
    rating: { rate: 4.6, count: 88 },
    stock: 40
  },
  {
    id: "8",
    title: "LUMISTYLE 'LUNA' Sterling Silver Pearl Drop Earrings",
    price: 99.99,
    description: "Delicate drop earrings crafted from sterling silver. Adorned with premium cultured freshwater pearls suspended below a micro-set starburst cubic zirconia stud. Pure understated elegance.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600",
    rating: { rate: 4.8, count: 59 },
    stock: 22
  },
  {
    id: "9",
    title: "LUMISTYLE 'SOLIS' Silk Floral Summer Dress",
    price: 159.99,
    description: "An elegant A-line summer dress woven from pure Mulberry silk. Embellished with a hand-painted floral motif, features a delicate v-neckline and adjustable tie straps for a romantic touch.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600",
    rating: { rate: 4.9, count: 30 },
    stock: 15
  },
  {
    id: "10",
    title: "LUMISTYLE 'VERDE' Breathable Linen Summer Shirt",
    price: 79.99,
    description: "Woven in Italy from sustainable French flax linen. Soft, ultra-breathable, and styled with a clean band collar. Dyed in a rich emerald green shade perfect for coastal warm-weather settings.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
    rating: { rate: 4.6, count: 45 },
    stock: 20
  },
  {
    id: "11",
    title: "LUMISTYLE 'CHRONOS' Minimalist Gold Watch",
    price: 299.99,
    description: "Crafted in surgical-grade stainless steel with 18k gold plating. Features a scratch-resistant sapphire crystal glass, Swiss quartz movement, and an adjustable Milanese mesh strap.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600",
    rating: { rate: 4.8, count: 51 },
    stock: 10
  },
  {
    id: "12",
    title: "LUMISTYLE 'PRISM' Luxury Leather Crossbody Bag",
    price: 199.99,
    description: "A compact crossbody bag handcrafted from premium full-grain pebbled leather. Features polished gold-tone hardware, multiple card slots, and an adjustable, detachable leather shoulder strap.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600",
    rating: { rate: 4.9, count: 65 },
    stock: 14
  },
  {
    id: "13",
    title: "LUMISTYLE 'ZEPHYR' Casual Knitwear Hoodie",
    price: 119.99,
    description: "An incredibly soft everyday hoodie knitted from a blend of long-staple cotton and fine cashmere. Styled with a tailored modern fit, drop shoulders, and reinforced ribbed trims.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600",
    rating: { rate: 4.7, count: 38 },
    stock: 25
  },
  {
    id: "14",
    title: "LUMISTYLE 'VISTA' Classic Acetate Sunglasses",
    price: 139.99,
    description: "Classic design featuring polarized UV400 protective lenses hand-assembled in a robust tortoiseshell bio-acetate frame. Completed with reinforced 5-barrel hinges.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600",
    rating: { rate: 4.8, count: 29 },
    stock: 30
  },
  {
    id: "15",
    title: "LUMISTYLE 'MARINA' Striped Silk Scarf",
    price: 49.99,
    description: "A versatile square scarf in pure silk twill, printed with navy and cream nautical stripes. Finished with hand-rolled edges for a clean, classic drape.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?w=600",
    rating: { rate: 4.7, count: 19 },
    stock: 40
  },
  {
    id: "16",
    title: "LUMISTYLE 'TERRA' Rugged Leather Jacket",
    price: 279.99,
    description: "A heavy-duty biker jacket cut from supple oil-tanned lambskin leather. Features antique brass zipper accents, a snap-tab collar, and a warm quilted satin inner lining.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600",
    rating: { rate: 4.8, count: 77 },
    stock: 12
  },
  {
    id: "17",
    title: "LUMISTYLE 'STELLA' Diamond Eternity Ring",
    price: 499.99,
    description: "Cast in solid 14k white gold, this elegant band features a continuous circle of sparkling brilliant-cut lab diamonds totaling 1.5 carats in a classic prong setting.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600",
    rating: { rate: 4.9, count: 88 },
    stock: 8
  },
  {
    id: "18",
    title: "LUMISTYLE 'PULSE' Noise Isolating Headphones",
    price: 189.99,
    description: "Premium over-ear wireless headphones with active noise cancellation, custom dynamic drivers, and memory foam earcups wrapped in soft leatherette. Delivers up to 40 hours of playtime.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    rating: { rate: 4.7, count: 92 },
    stock: 15
  },
  {
    id: "19",
    title: "LUMISTYLE 'NOMAD' Waterproof Canvas Backpack",
    price: 109.95,
    description: "A durable, weatherproof canvas travel pack featuring top-grain leather straps, quick-access magnetic closures, and a dedicated padded sleeve for up to 16-inch laptops.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    rating: { rate: 4.8, count: 110 },
    stock: 18
  },
  {
    id: "20",
    title: "LUMISTYLE 'AEON' Gold Plated Bangle Bracelet",
    price: 149.99,
    description: "An elegant, polished bangle cast in hypoallergenic brass and heavily plated in 18k yellow gold. Secured with a discrete integrated hinge and safety clasp.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600",
    rating: { rate: 4.7, count: 50 },
    stock: 22
  }
];

// Seeding products locally
const seedProducts = async () => {
  initialProducts.forEach(item => {
    if (!products.some(p => String(p.id) === String(item.id))) {
      products.push(item);
    }
  });
  console.log(`Seeded ${products.length} LUMISTYLE products.`);
};

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'LUMISTYLE E-Commerce API is running smoothly!' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Startup server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Initialize in-memory records
  await initializeUsers();
  await seedProducts();
  
  app.listen(PORT, () => {
    console.log(`Server running in development mode on port ${PORT}`);
  });
};

startServer();
// Trigger nodemon restart after product title renaming database migration
