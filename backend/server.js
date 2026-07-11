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
    title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
    price: 109.95,
    description: "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    rating: { rate: 3.9, count: 120 },
    stock: 45
  },
  {
    id: "2",
    title: "Mens Casual Premium Slim Fit T-Shirts ",
    price: 22.3,
    description: "Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing. And Solid stitched shirts with round neck made for durability and a great fit for casual fashion wear and diehard baseball fans. The henley style round collar includes a three-button placket.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600",
    rating: { rate: 4.1, count: 259 },
    stock: 30
  },
  {
    id: "3",
    title: "Mens Cotton Jacket",
    price: 55.99,
    description: "great outerwear jackets for Men, suitable for outdoor activities like hiking, camping, climbing, traveling, etc.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600",
    rating: { rate: 4.7, count: 500 },
    stock: 15
  },
  {
    id: "4",
    title: "Mens Casual Slim Fit",
    price: 15.99,
    description: "The color could be slightly different between on the screen and in practice. / Please note that body builds vary by person, therefore, detailed size information should be reviewed below on the product description.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600",
    rating: { rate: 2.1, count: 430 },
    stock: 25
  },
  {
    id: "5",
    title: "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet",
    price: 695,
    description: "From our Legends Collection, the Naga was inspired by the mythical water dragon that protects the ocean's pearl. Wear facing inward to be bestowed with love and abundance, or outward for protection.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600",
    rating: { rate: 4.6, count: 400 },
    stock: 10
  },
  {
    id: "6",
    title: "Solid Gold Petite Micropave ",
    price: 168,
    description: "Satisfaction Guaranteed. Return or exchange any order within 30 days. Designed and crafted in 14k gold with micro-pave detailing.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600",
    rating: { rate: 3.9, count: 70 },
    stock: 50
  },
  {
    id: "7",
    title: "White Gold Plated Princess",
    price: 9.99,
    description: "Classic Created Wedding Engagement Ring. Gift Box Included. Made of premium white gold plated alloy.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600",
    rating: { rate: 3, count: 400 },
    stock: 50
  },
  {
    id: "8",
    title: "Pierced Owl Rose Gold Plated Stainless Steel Double",
    price: 10.99,
    description: "Rose Gold Plated Double Flared Tunnel Plug. Made of 316L Stainless Steel.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600",
    rating: { rate: 1.9, count: 100 },
    stock: 50
  },
  {
    id: "9",
    title: "WD 2TB Elements Portable External Hard Drive - USB 3.0 ",
    price: 64,
    description: "USB 3.0 and USB 2.0 Compatibility, Fast data transfers, Improve PC Performance, High Capacity; Compatibility Formatted NTFS for Windows 10, Windows 8.1, Windows 7; Reformatting may be required for other operating systems.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600",
    rating: { rate: 3.3, count: 203 },
    stock: 50
  },
  {
    id: "10",
    title: "SanDisk SSD PLUS 1TB Internal SSD - SATA III 6 Gb/s",
    price: 109,
    description: "Easy upgrade for faster boot up, shutdown, application load and response. Boosts burst write performance, making it ideal for typical PC workloads.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600",
    rating: { rate: 2.9, count: 470 },
    stock: 50
  },
  {
    id: "11",
    title: "Silicon Power 256GB SSD 3D NAND A55 SLC Cache Performance Boost SATA III 2.5",
    price: 29.99,
    description: "3D NAND flash are applied to deliver high transfer speeds. Remarkable transfer speeds that enable faster bootup and improved overall system performance.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1601524909162-be87252be298?w=600",
    rating: { rate: 4.8, count: 319 },
    stock: 50
  },
  {
    id: "12",
    title: "WD 4TB Gaming Drive Works with Playstation 4 Portable External Hard Drive",
    price: 114,
    description: "Expand your PS4 gaming experience, Play anywhere Fast and easy setup.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1597872200919-0127a4b09a68?w=600",
    rating: { rate: 4.8, count: 400 },
    stock: 50
  },
  {
    id: "13",
    title: "Acer SB220Q bi 21.5 inches Full HD (1920 x 1080) IPS Ultra-Thin",
    price: 599,
    description: "21. 5 inches Full HD (1920 x 1080) widescreen IPS display And Radeon free Sync technology.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600",
    rating: { rate: 2.9, count: 250 },
    stock: 50
  },
  {
    id: "14",
    title: "Samsung 49-Inch CHG90 144Hz Curved Gaming Monitor (LC49HG90DMNXZA) – Super Ultrawide Screen QLED ",
    price: 999.99,
    description: "49 inches super ultrawide 32:9 curved gaming monitor with dual 27 inches screens side by side.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-158579178067c-451ed92173c7?w=600",
    rating: { rate: 2.2, count: 140 },
    stock: 50
  },
  {
    id: "15",
    title: "BIYLACLESEN Women's 3-in-1 Snowboard Jacket Winter Coats",
    price: 56.99,
    description: "Material: 100% Polyester; Detachable Liner Fabric: Warm Fleece. Detachable Hood: The windbreak hood can be detached with zipper.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600",
    rating: { rate: 2.6, count: 235 },
    stock: 50
  },
  {
    id: "16",
    title: "Lock and Love Women's Removable Hooded Faux Leather Moto Biker Jacket",
    price: 29.95,
    description: "Faux leather material for style and comfort / Detail stitching on sides, 2 pockets on front.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1481824429379-07aa5e5b0739?w=600",
    rating: { rate: 2.9, count: 340 },
    stock: 50
  },
  {
    id: "17",
    title: "Rain Jacket Women Windbreaker Striped Climbing Raincoats",
    price: 39.99,
    description: "Lightweight weather resistant fabric, adjustable drawstring hood and waist, striped cotton lining, waterproof zipper pockets.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600",
    rating: { rate: 3.8, count: 679 },
    stock: 50
  },
  {
    id: "18",
    title: "MBJ Women's Solid Short Sleeve Boat Neck V ",
    price: 9.85,
    description: "Lightweight fabric with great stretch for comfort, double stitching on sleeves and bottom hem.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600",
    rating: { rate: 4.7, count: 130 },
    stock: 50
  },
  {
    id: "19",
    title: "Opna Women's Short Sleeve Moisture",
    price: 7.95,
    description: "100% Polyester, Machine Wash, lightweight, moisture wicking, breathable fabric.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600",
    rating: { rate: 4.5, count: 146 },
    stock: 50
  },
  {
    id: "20",
    title: "DANVOUY Womens T Shirt Casual Cotton Short",
    price: 12.99,
    description: "95% Cotton, 5% Spandex, Casual, lightweight, comfortable fit for hot summer days.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600",
    rating: { rate: 3.6, count: 145 },
    stock: 50
  },
  {
    id: "21",
    title: "LUMISTYLE 'AURA' Premium Obsidian Trench Coat",
    price: 249.99,
    description: "An avant-garde long trench coat crafted from a water-resistant technical cotton blend. Featuring architectural lapels, deep utility pockets, and a matte black magnetic belt clasp.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600",
    rating: { rate: 4.9, count: 48 },
    stock: 20
  },
  {
    id: "22",
    title: "LUMISTYLE 'NOVA' Electric Pink Knit Crop Top",
    price: 89.99,
    description: "A vibrant cropped knitwear piece crafted from organic mercerized cotton. Featuring ribbed cuffs, an athletic racerback design, and subtle electric purple accents around the seams.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600",
    rating: { rate: 4.8, count: 62 },
    stock: 35
  },
  {
    id: "23",
    title: "LUMISTYLE 'KRONOS' Smart Sleek Audio Sunglasses",
    price: 179.99,
    description: "Tech-fashion at its peak. Polarized UV400 lenses housed in a lightweight matte black titanium frame. Equipped with open-ear dual speaker micro-drivers, Bluetooth 5.2 connectivity.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600",
    rating: { rate: 4.7, count: 34 },
    stock: 15
  },
  {
    id: "24",
    title: "LUMISTYLE 'VORTEX' Gold Chain Crescent Pendant",
    price: 129.99,
    description: "A stunning minimalist jewelry item cast in solid sterling silver and plated in 18k yellow gold.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600",
    rating: { rate: 4.9, count: 75 },
    stock: 25
  },
  {
    id: "25",
    title: "LUMISTYLE 'NOIR' Luxury Leather Chelsea Boots",
    price: 189.99,
    description: "Handcrafted in Italy from full-grain calfskin leather. Fitted with flexible elastic side panels, a premium leather lining, and a durable stacked heel.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600",
    rating: { rate: 4.8, count: 52 },
    stock: 18
  },
  {
    id: "26",
    title: "LUMISTYLE 'VALENCE' Cropped Obsidian Puffer Jacket",
    price: 219.99,
    description: "A high-gloss cropped puffer jacket insulated with premium down fill. Designed with a high funnel collar, water-resistant zippers.",
    category: "women's clothing",
    image: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600",
    rating: { rate: 4.9, count: 41 },
    stock: 12
  },
  {
    id: "27",
    title: "LUMISTYLE 'ECLIPSE' Active Hybrid Sport Earbuds",
    price: 149.99,
    description: "Next-generation active noise-canceling earbuds. Featuring custom-tuned 11mm drivers, IPX7 sweatproof resistance, and an ergonomic secure-fit earhook.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600",
    rating: { rate: 4.6, count: 88 },
    stock: 40
  },
  {
    id: "28",
    title: "LUMISTYLE 'LUNA' Sterling Silver Pearl Drop Earrings",
    price: 99.99,
    description: "Delicate drop earrings crafted from sterling silver. Adorned with premium cultured freshwater pearls suspended below a micro-set starburst cubic zirconia stud.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600",
    rating: { rate: 4.8, count: 59 },
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
