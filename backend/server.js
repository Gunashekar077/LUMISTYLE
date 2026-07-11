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

// Seeding products locally and from Fake Store API with image mapping
const seedProducts = async () => {
  const unsplashMapping = {
    1: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600", // Backpack
    2: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600", // T-shirt
    3: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600", // Cotton Jacket
    4: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600", // Slim Fit Shirt
    5: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600", // Dragon Chain Bracelet
    6: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600", // Solid Gold Micropave Ring
    7: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600", // Princess Ring
    8: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600", // Stainless Steel Double
    9: "https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=600", // Portable Hard Drive (SSD image)
    10: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600", // 1TB Internal SSD
    11: "https://images.unsplash.com/photo-1601524909162-be87252be298?w=600", // 256GB SSD
    12: "https://images.unsplash.com/photo-1597872200919-0127a4b09a68?w=600", // 4TB Gaming Drive
    13: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600", // 21.5 Inch IPS Monitor
    14: "https://images.unsplash.com/photo-158579178067c-451ed92173c7?w=600", // 49-Inch curved monitor
    15: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600", // Women's Snowboard Jacket
    16: "https://images.unsplash.com/photo-1481824429379-07aa5e5b0739?w=600", // Faux Leather Moto Biker
    17: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600", // Rain Jacket Women Windbreaker
    18: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600", // Boat Neck V Shirt
    19: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600", // Short Sleeve Moisture Shirt
    20: "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600"  // DANVOUY Womens T Shirt
  };

  try {
    console.log('Fetching initial products from Fake Store API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout
    
    const response = await fetch('https://fakestoreapi.com/products', { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      data.forEach(item => {
        const mappedImage = unsplashMapping[item.id] || item.image;
        const exists = products.find(p => String(p.id) === String(item.id));
        if (exists) {
          exists.image = mappedImage;
        } else {
          products.push({
            id: String(item.id),
            title: item.title,
            price: item.price,
            description: item.description,
            category: item.category,
            image: mappedImage,
            rating: item.rating || { rate: 4.0, count: 5 },
            stock: 50
          });
        }
      });
      console.log('Successfully loaded Fake Store API products with Unsplash image mapping.');
    }
  } catch (error) {
    console.warn('Unable to seed/map products from Fake Store API (possibly offline/slow):', error.message);
  }

  // Seeding custom items
  const customItems = [
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

  customItems.forEach(item => {
    const exists = products.find(p => String(p.id) === String(item.id));
    if (!exists) {
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
  seedProducts(); // Seed in background so server starts immediately without hanging on slow APIs

  app.listen(PORT, () => {
    console.log(`Server running in development mode on port ${PORT}`);
  });
};

startServer();
