import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Define Schemas
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }
});

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String },
  image: { type: String },
  stock: { type: Number, default: 50 },
  ratingRate: { type: Number, default: 4.5 },
  ratingCount: { type: Number, default: 10 }
});

const cartItemSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  productId: { type: String, required: true },
  quantity: { type: Number, default: 1 }
});
cartItemSchema.index({ userId: 1, productId: 1 });

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  image: { type: String }
});

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  products: [orderItemSchema],
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  shippingDetails: { type: mongoose.Schema.Types.Mixed },
  paymentMethod: { type: String, default: 'cod' },
  orderStatus: { type: String, default: 'Processing' },
  createdAt: { type: String }
});

// Compile Models
const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const CartItem = mongoose.model('CartItem', cartItemSchema);
const Order = mongoose.model('Order', orderSchema);

// Flags to disable DB writes during startup synchronization
let isSyncing = false;

// In-memory "tables" for synchronous controller compatibility
const users = [];
const carts = {}; // Map of userId -> array of { productId, quantity }
const orders = [];

// Proxy array for products to auto-save items pushed into it (like the seed data in server.js)
const products = new Proxy([], {
  set(target, property, value, receiver) {
    if (mongoose.connection.readyState === 1 && !isSyncing && property !== 'length' && value && value.id) {
      const productId = String(value.id);
      Product.findOne({ id: productId }).then(exists => {
        if (!exists) {
          Product.create({
            id: productId,
            title: value.title,
            description: value.description || '',
            price: parseFloat(value.price) || 0,
            category: value.category || 'General',
            image: value.image || '',
            stock: parseInt(value.stock) || 50,
            ratingRate: parseFloat(value.rating?.rate) || 4.5,
            ratingCount: parseInt(value.rating?.count) || 10
          }).catch(err => console.error('DB Error auto-creating product:', err));
        }
      }).catch(err => console.error('DB Error checking product:', err));
    }
    return Reflect.set(target, property, value, receiver);
  }
});

// Helper to generate unique string IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Initialize data store with default users
const initializeUsers = async () => {
  const hasRebrandedUser = users.some(u => u && u.email && typeof u.email === 'string' && u.email.toLowerCase() === 'user@lumistyle.com');
  if (!hasRebrandedUser) {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);
    
    const adminUser = {
      id: 'admin_user_id_lumi',
      name: 'Admin User',
      email: 'admin@lumistyle.com',
      password: adminPassword,
      role: 'admin'
    };
    
    const testUser = {
      id: 'test_user_id_lumi',
      name: 'Test User',
      email: 'user@lumistyle.com',
      password: userPassword,
      role: 'user'
    };

    // Stage in memory if not already present
    if (!users.some(u => u && u.email && typeof u.email === 'string' && u.email.toLowerCase() === 'admin@lumistyle.com')) {
      users.push(adminUser);
    }
    users.push(testUser);

    // Update DB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const adminExists = await User.findOne({ email: 'admin@lumistyle.com' });
        if (!adminExists) await User.create(adminUser);
        
        const testExists = await User.findOne({ email: 'user@lumistyle.com' });
        if (!testExists) await User.create(testUser);
      } catch (err) {
        console.error('Error seeding rebranded users in MongoDB:', err);
      }
    }
    
    console.log('In-memory users and MongoDB user database initialized successfully with rebranded user.');
  }
};

// Database synchronizer
const initializeUsersStore = async () => {
  try {
    const dbUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb+srv://reddigunashekar_db_user:Gunareddi077@cluster0.u0hlsjw.mongodb.net/lumistyle?retryWrites=true&w=majority';

    if (!dbUri || dbUri.includes('<password>')) {
      console.warn('WARNING: MONGO_URI/MONGODB_URI is not set or contains the <password> placeholder.');
      console.warn('Backend will fall back to using memory-only store. Please update .env or environment variables with your MongoDB password.');
      return;
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB successfully.');
    
    isSyncing = true;
    
    // Load Users from DB
    const dbUsers = await User.find({});
    users.length = 0;
    dbUsers.forEach(u => users.push({
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role
    }));
    
    // Load Products from DB
    const dbProducts = await Product.find({});
    products.length = 0;
    dbProducts.forEach(prod => {
      products.push({
        id: prod.id,
        title: prod.title,
        description: prod.description,
        price: prod.price,
        category: prod.category,
        image: prod.image,
        stock: prod.stock,
        rating: {
          rate: prod.ratingRate,
          count: prod.ratingCount
        }
      });
    });

    // Load Cart Items from DB
    const dbCarts = await CartItem.find({});
    Object.keys(carts).forEach(key => delete carts[key]);
    dbCarts.forEach(item => {
      if (!carts[item.userId]) {
        carts[item.userId] = [];
      }
      carts[item.userId].push({
        productId: item.productId,
        quantity: item.quantity
      });
    });

    // Load Orders from DB
    const dbOrders = await Order.find({});
    orders.length = 0;
    dbOrders.forEach(o => {
      let shippingDetails = o.shippingDetails || {};
      if (typeof shippingDetails === 'string') {
        try {
          shippingDetails = JSON.parse(shippingDetails);
        } catch (e) {
          shippingDetails = {};
        }
      }
      
      orders.push({
        id: o.id,
        userId: o.userId,
        subtotal: o.subtotal,
        shippingFee: o.shippingFee,
        tax: o.tax,
        discount: o.discount,
        totalAmount: o.totalAmount,
        shippingDetails,
        paymentMethod: o.paymentMethod,
        orderStatus: o.orderStatus,
        createdAt: o.createdAt,
        products: o.products.map(item => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }))
      });
    });

    isSyncing = false;
    console.log('Database synced & cache populated successfully from MongoDB.');

    // Seed default admin/user if none exist
    await initializeUsers();
  } catch (err) {
    isSyncing = false;
    console.error('Error synchronizing database schema with MongoDB:', err);
  }
};

// Users functions
export const getUserByEmail = (email) => {
  if (!email || typeof email !== 'string') return null;
  return users.find(u => u && u.email && typeof u.email === 'string' && u.email.toLowerCase() === email.toLowerCase());
};

export const getUserById = (id) => {
  const user = users.find(u => u.id === id);
  if (!user) return null;
  // Exclude password in return
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: generateId(),
    name,
    email,
    password: hashedPassword,
    role
  };
  
  // Sync Memory
  users.push(newUser);
  
  // Sync DB in background if connected
  if (mongoose.connection.readyState === 1) {
    User.create(newUser).catch(err => console.error('DB Error creating user:', err));
  }

  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// Products functions
export const getProducts = () => {
  return products;
};

export const getProductById = (id) => {
  return products.find(p => String(p.id) === String(id));
};

export const createProduct = (productData) => {
  const newProduct = {
    id: generateId(), // String ID for custom added products
    title: productData.title,
    description: productData.description || '',
    price: parseFloat(productData.price) || 0,
    category: productData.category || 'General',
    image: productData.image || 'https://via.placeholder.com/150',
    stock: parseInt(productData.stock) || 50,
    rating: {
      rate: 4.5,
      count: 10
    }
  };
  
  // Sync Memory
  products.push(newProduct);
  
  // Sync DB in background if connected
  if (mongoose.connection.readyState === 1) {
    Product.create({
      id: newProduct.id,
      title: newProduct.title,
      description: newProduct.description,
      price: newProduct.price,
      category: newProduct.category,
      image: newProduct.image,
      stock: newProduct.stock,
      ratingRate: newProduct.rating.rate,
      ratingCount: newProduct.rating.count
    }).catch(err => console.error('DB Error creating product:', err));
  }

  return newProduct;
};

export const updateProduct = (id, productData) => {
  const index = products.findIndex(p => String(p.id) === String(id));
  if (index === -1) return null;
  
  const updatedProduct = {
    ...products[index],
    title: productData.title !== undefined ? productData.title : products[index].title,
    description: productData.description !== undefined ? productData.description : products[index].description,
    price: productData.price !== undefined ? parseFloat(productData.price) : products[index].price,
    category: productData.category !== undefined ? productData.category : products[index].category,
    image: productData.image !== undefined ? productData.image : products[index].image,
    stock: productData.stock !== undefined ? parseInt(productData.stock) : products[index].stock,
  };
  
  // Sync Memory
  products[index] = updatedProduct;
  
  // Sync DB in background if connected
  if (mongoose.connection.readyState === 1) {
    Product.updateOne(
      { id: String(id) },
      {
        title: updatedProduct.title,
        description: updatedProduct.description,
        price: updatedProduct.price,
        category: updatedProduct.category,
        image: updatedProduct.image,
        stock: updatedProduct.stock
      }
    ).catch(err => console.error('DB Error updating product:', err));
  }

  return updatedProduct;
};

export const deleteProduct = (id) => {
  const index = products.findIndex(p => String(p.id) === String(id));
  if (index === -1) return false;
  
  // Sync Memory
  products.splice(index, 1);
  
  // Sync DB in background if connected
  if (mongoose.connection.readyState === 1) {
    Product.deleteOne({ id: String(id) }).catch(err => console.error('DB Error deleting product:', err));
  }

  return true;
};

// Cart functions
export const getCart = (userId) => {
  if (!carts[userId]) {
    carts[userId] = [];
  }
  return carts[userId];
};

export const saveCart = (userId, cartItems) => {
  const normalizedItems = cartItems.map(item => ({
    productId: String(item.productId),
    quantity: parseInt(item.quantity) || 1
  }));
  
  // Sync Memory
  carts[userId] = normalizedItems;
  
  // Sync DB in background (clear existing and bulk create) if connected
  if (mongoose.connection.readyState === 1) {
    CartItem.deleteMany({ userId })
      .then(() => {
        if (normalizedItems.length > 0) {
          return CartItem.insertMany(normalizedItems.map(item => ({
            userId,
            productId: item.productId,
            quantity: item.quantity
          })));
        }
      })
      .catch(err => console.error('DB Error saving cart:', err));
  }

  return carts[userId];
};

export const clearCart = (userId) => {
  // Sync Memory
  carts[userId] = [];
  
  // Sync DB in background if connected
  if (mongoose.connection.readyState === 1) {
    CartItem.deleteMany({ userId }).catch(err => console.error('DB Error clearing cart:', err));
  }

  return [];
};

// Orders functions
export const createOrder = (userId, orderItems, pricingDetails, shippingDetails, paymentMethod) => {
  const newOrder = {
    id: 'ord_' + generateId(),
    userId,
    products: orderItems.map(item => ({
      productId: String(item.productId || item.id),
      title: item.title,
      price: parseFloat(item.price),
      quantity: parseInt(item.quantity) || 1,
      image: item.image || ''
    })),
    subtotal: parseFloat(pricingDetails.subtotal) || 0,
    shippingFee: parseFloat(pricingDetails.shippingFee) || 0,
    tax: parseFloat(pricingDetails.tax) || 0,
    discount: parseFloat(pricingDetails.discount) || 0,
    totalAmount: parseFloat(pricingDetails.grandTotal) || parseFloat(pricingDetails.subtotal) || 0,
    shippingDetails: shippingDetails || {},
    paymentMethod: paymentMethod || 'cod',
    orderStatus: 'Processing',
    createdAt: new Date().toISOString()
  };
  
  // Sync Memory
  orders.push(newOrder);
  
  // Sync DB in background if connected
  if (mongoose.connection.readyState === 1) {
    Order.create({
      id: newOrder.id,
      userId: newOrder.userId,
      products: newOrder.products,
      subtotal: newOrder.subtotal,
      shippingFee: newOrder.shippingFee,
      tax: newOrder.tax,
      discount: newOrder.discount,
      totalAmount: newOrder.totalAmount,
      shippingDetails: newOrder.shippingDetails,
      paymentMethod: newOrder.paymentMethod,
      orderStatus: newOrder.orderStatus,
      createdAt: newOrder.createdAt
    }).catch(err => console.error('DB Error creating order:', err));
  }

  return newOrder;
};

export const getOrdersByUserId = (userId) => {
  return orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getAllOrders = () => {
  return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getOrderById = (id) => {
  return orders.find(o => o.id === id);
};

export const updateUserPassword = async (email, newRawPassword) => {
  if (!email || typeof email !== 'string') return false;
  const hashedPassword = await bcrypt.hash(newRawPassword, 10);
  const index = users.findIndex(u => u && u.email && typeof u.email === 'string' && u.email.toLowerCase() === email.toLowerCase());
  if (index === -1) return false;
  
  // Update in-memory
  users[index].password = hashedPassword;
  
  // Update DB if connected
  if (mongoose.connection.readyState === 1) {
    await User.updateOne({ email: email.toLowerCase() }, { password: hashedPassword });
  }
  return true;
};

// Export initializeUsers for compatibility, but map it to our DB load function
const initializeUsersExport = initializeUsersStore;

export { users, products, carts, orders, initializeUsersExport as initializeUsers };
