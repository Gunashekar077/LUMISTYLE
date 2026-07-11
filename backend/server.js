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

// Seeding products locally
const seedProducts = async () => {
  const customItems = [
    {
      id: "1",
      title: "LUMISTYLE 'AURA' Premium Obsidian Trench Coat",
      price: 249.99,
      description: "An avant-garde long trench coat crafted from a water-resistant technical cotton blend. Featuring architectural lapels, deep utility pockets, and a matte black magnetic belt clasp.",
      category: "men's clothing",
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600",
      rating: { rate: 4.9, count: 48 },
      stock: 20
    },
    {
      id: "2",
      title: "LUMISTYLE 'NOVA' Electric Pink Knit Crop Top",
      price: 89.99,
      description: "A vibrant cropped knitwear piece crafted from organic mercerized cotton. Featuring ribbed cuffs, an athletic racerback design, and subtle electric purple accents around the seams.",
      category: "women's clothing",
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600",
      rating: { rate: 4.8, count: 62 },
      stock: 35
    },
    {
      id: "3",
      title: "LUMISTYLE 'KRONOS' Smart Sleek Audio Sunglasses",
      price: 179.99,
      description: "Tech-fashion at its peak. Polarized UV400 lenses housed in a lightweight matte black titanium frame. Equipped with open-ear dual speaker micro-drivers, Bluetooth 5.2 connectivity.",
      category: "electronics",
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600",
      rating: { rate: 4.7, count: 34 },
      stock: 15
    },
    {
      id: "4",
      title: "LUMISTYLE 'VORTEX' Gold Chain Crescent Pendant",
      price: 129.99,
      description: "A stunning minimalist jewelry item cast in solid sterling silver and plated in 18k yellow gold.",
      category: "jewelery",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600",
      rating: { rate: 4.9, count: 75 },
      stock: 25
    },
    {
      id: "5",
      title: "LUMISTYLE 'NOIR' Luxury Leather Chelsea Boots",
      price: 189.99,
      description: "Handcrafted in Italy from full-grain calfskin leather. Fitted with flexible elastic side panels, a premium leather lining, and a durable stacked heel.",
      category: "men's clothing",
      image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600",
      rating: { rate: 4.8, count: 52 },
      stock: 18
    },
    {
      id: "6",
      title: "LUMISTYLE 'VALENCE' Cropped Obsidian Puffer Jacket",
      price: 219.99,
      description: "A high-gloss cropped puffer jacket insulated with premium down fill. Designed with a high funnel collar, water-resistant zippers.",
      category: "women's clothing",
      image: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600",
      rating: { rate: 4.9, count: 41 },
      stock: 12
    },
    {
      id: "7",
      title: "LUMISTYLE 'ECLIPSE' Active Hybrid Sport Earbuds",
      price: 149.99,
      description: "Next-generation active noise-canceling earbuds. Featuring custom-tuned 11mm drivers, IPX7 sweatproof resistance, and an ergonomic secure-fit earhook.",
      category: "electronics",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600",
      rating: { rate: 4.6, count: 88 },
      stock: 40
    },
    {
      id: "8",
      title: "LUMISTYLE 'LUNA' Sterling Silver Pearl Drop Earrings",
      price: 99.99,
      description: "Delicate drop earrings crafted from sterling silver. Adorned with premium cultured freshwater pearls suspended below a micro-set starburst cubic zirconia stud.",
      category: "jewelery",
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600",
      rating: { rate: 4.8, count: 59 },
      stock: 22
    }
  ];

  customItems.forEach(item => {
    if (!products.some(p => String(p.id) === String(item.id))) {
      products.push(item);
    }
  });
  console.log(`Seeded ${products.length} products locally.`);
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
