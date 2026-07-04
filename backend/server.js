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

// Seeding products from Fake Store API or Fallback
const seedProducts = async () => {
  try {
    console.log('Fetching initial products for in-memory seed...');
    const response = await fetch('https://fakestoreapi.com/products');
    if (response.ok) {
      const data = await response.json();
      // Map to add stock field
      data.forEach(item => {
        products.push({
          id: item.id, // Keep numeric ID for fake store api compatibility
          title: item.title,
          price: item.price,
          description: item.description,
          category: item.category,
          image: item.image,
          rating: item.rating || { rate: 4.0, count: 5 },
          stock: 50 // Default stock
        });
      });
      console.log(`Seeded ${products.length} products from Fake Store API.`);
    } else {
      throw new Error('Failed to fetch from API');
    }
  } catch (error) {
    console.warn('Unable to seed products from Fake Store API, using fallback data:', error.message);
    
    // Fallback data if offline or API is down
    const fallbacks = [
      {
        id: 1,
        title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
        price: 109.95,
        description: "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
        category: "men's clothing",
        image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
        rating: { rate: 3.9, count: 120 },
        stock: 45
      },
      {
        id: 2,
        title: "Mens Casual Premium Slim Fit T-Shirts ",
        price: 22.3,
        description: "Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing. And Solid stitched shirts with round neck made for durability and a great fit for casual fashion wear and diehard baseball fans. The henley style round collar includes a three-button placket.",
        category: "men's clothing",
        image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
        rating: { rate: 4.1, count: 259 },
        stock: 30
      },
      {
        id: 3,
        title: "Mens Cotton Jacket",
        price: 55.99,
        description: "great outerwear jackets for Men, suitable for outdoor activities like hiking, camping, climbing, traveling, etc.",
        category: "men's clothing",
        image: "https://fakestoreapi.com/img/71li-albeoL._AC_UX679_.jpg",
        rating: { rate: 4.7, count: 500 },
        stock: 15
      },
      {
        id: 4,
        title: "Mens Casual Slim Fit",
        price: 15.99,
        description: "The color could be slightly different between on the screen and in practice. / Please note that body builds vary by person, therefore, detailed size information should be reviewed below on the product description.",
        category: "men's clothing",
        image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
        rating: { rate: 2.1, count: 430 },
        stock: 25
      },
      {
        id: 5,
        title: "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet",
        price: 695,
        description: "From our Legends Collection, the Naga was inspired by the mythical water dragon that protects the ocean's pearl. Wear facing inward to be bestowed with love and abundance, or outward for protection.",
        category: "jewelery",
        image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg",
        rating: { rate: 4.6, count: 400 },
        stock: 10
      }
    ];
    
    fallbacks.forEach(item => products.push(item));
    console.log(`Seeded ${products.length} fallback products.`);
  }

  // Custom DG-FASHION luxury additions
  const customItems = [
    {
      id: 21,
      title: "DG-FASHION 'AURA' Premium Obsidian Trench Coat",
      price: 249.99,
      description: "An avant-garde long trench coat crafted from a water-resistant technical cotton blend. Featuring architectural lapels, deep utility pockets, and a matte black magnetic belt clasp. Styled for absolute luxury and seamless design system compliance.",
      category: "men's clothing",
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600",
      rating: { rate: 4.9, count: 48 },
      stock: 20
    },
    {
      id: 22,
      title: "DG-FASHION 'NOVA' Electric Pink Knit Crop Top",
      price: 89.99,
      description: "A vibrant cropped knitwear piece crafted from organic mercerized cotton. Featuring ribbed cuffs, an athletic racerback design, and subtle electric purple accents around the seams. Perfect for energetic everyday styling.",
      category: "women's clothing",
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600",
      rating: { rate: 4.8, count: 62 },
      stock: 35
    },
    {
      id: 23,
      title: "DG-FASHION 'KRONOS' Smart Sleek Audio Sunglasses",
      price: 179.99,
      description: "Tech-fashion at its peak. Polarized UV400 lenses housed in a lightweight matte black titanium frame. Equipped with open-ear dual speaker micro-drivers, Bluetooth 5.2 connectivity, and touch-sensitive temples for intuitive music controls.",
      category: "electronics",
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600",
      rating: { rate: 4.7, count: 34 },
      stock: 15
    },
    {
      id: 24,
      title: "DG-FASHION 'VORTEX' Gold Chain Crescent Pendant",
      price: 129.99,
      description: "A stunning minimalist jewelry item cast in solid sterling silver and plated in 18k yellow gold. Featuring a micro-set cubic zirconia crescent moon centerpiece suspended on a delicate 45cm adjustable box chain.",
      category: "jewelery",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600",
      rating: { rate: 4.9, count: 75 },
      stock: 25
    },
    {
      id: 25,
      title: "DG-FASHION 'NOIR' Luxury Leather Chelsea Boots",
      price: 189.99,
      description: "Handcrafted in Italy from full-grain calfskin leather. Fitted with flexible elastic side panels, a premium leather lining, and a durable stacked heel. Sleek, minimalist, and built for ultimate comfort.",
      category: "men's clothing",
      image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600",
      rating: { rate: 4.8, count: 52 },
      stock: 18
    },
    {
      id: 26,
      title: "DG-FASHION 'VALENCE' Cropped Obsidian Puffer Jacket",
      price: 219.99,
      description: "A high-gloss cropped puffer jacket insulated with premium down fill. Designed with a high funnel collar, water-resistant zippers, and adjustable elastic drawcords at the waist hem.",
      category: "women's clothing",
      image: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600",
      rating: { rate: 4.9, count: 41 },
      stock: 12
    },
    {
      id: 27,
      title: "DG-FASHION 'ECLIPSE' Active Hybrid Sport Earbuds",
      price: 149.99,
      description: "Next-generation active noise-canceling earbuds. Featuring custom-tuned 11mm drivers, IPX7 sweatproof resistance, and an ergonomic secure-fit earhook. Delivers deep, resonant sound for up to 30 hours.",
      category: "electronics",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600",
      rating: { rate: 4.6, count: 88 },
      stock: 40
    },
    {
      id: 28,
      title: "DG-FASHION 'LUNA' Sterling Silver Pearl Drop Earrings",
      price: 99.99,
      description: "Delicate drop earrings crafted from sterling silver. Adorned with premium cultured freshwater pearls suspended below a micro-set starburst cubic zirconia stud. Pure understated elegance.",
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
};

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'UrbanCart E-Commerce API is running smoothly!' });
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
