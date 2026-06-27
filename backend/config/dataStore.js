import bcrypt from 'bcryptjs';
import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for SQLite storage path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Initialize Sequelize with SQLite dialect
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false, // Set to console.log to debug SQL queries if needed
});

// Define Models
const DBUser = sequelize.define('User', {
  id: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'user' }
});

const DBProduct = sequelize.define('Product', {
  id: { type: DataTypes.STRING, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.FLOAT, allowNull: false },
  category: { type: DataTypes.STRING },
  image: { type: DataTypes.STRING },
  stock: { type: DataTypes.INTEGER, defaultValue: 50 },
  ratingRate: { type: DataTypes.FLOAT, defaultValue: 4.5 },
  ratingCount: { type: DataTypes.INTEGER, defaultValue: 10 }
});

const DBCartItem = sequelize.define('CartItem', {
  userId: { type: DataTypes.STRING, allowNull: false },
  productId: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 }
});

const DBOrder = sequelize.define('Order', {
  id: { type: DataTypes.STRING, primaryKey: true },
  userId: { type: DataTypes.STRING, allowNull: false },
  subtotal: { type: DataTypes.FLOAT, allowNull: false },
  shippingFee: { type: DataTypes.FLOAT, defaultValue: 0 },
  tax: { type: DataTypes.FLOAT, defaultValue: 0 },
  discount: { type: DataTypes.FLOAT, defaultValue: 0 },
  totalAmount: { type: DataTypes.FLOAT, allowNull: false },
  shippingDetails: { type: DataTypes.TEXT }, // JSON stringified
  paymentMethod: { type: DataTypes.STRING, defaultValue: 'cod' },
  orderStatus: { type: DataTypes.STRING, defaultValue: 'Processing' },
  createdAt: { type: DataTypes.STRING }
});

const DBOrderItem = sequelize.define('OrderItem', {
  orderId: { type: DataTypes.STRING, allowNull: false },
  productId: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  image: { type: DataTypes.STRING }
});

// Flags to disable DB writes during startup synchronization
let isSyncing = false;

// In-memory "tables" for synchronous controller compatibility
const users = [];
const carts = {}; // Map of userId -> array of { productId, quantity }
const orders = [];

// Proxy array for products to auto-save items pushed into it (like the seed data in server.js)
const products = new Proxy([], {
  set(target, property, value, receiver) {
    if (!isSyncing && property !== 'length' && value && value.id) {
      const productId = String(value.id);
      DBProduct.findByPk(productId).then(exists => {
        if (!exists) {
          DBProduct.create({
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
  if (users.length === 0) {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);
    
    const adminUser = {
      id: 'admin_user_id',
      name: 'Admin User',
      email: 'admin@urbancart.com',
      password: adminPassword,
      role: 'admin'
    };
    
    const testUser = {
      id: 'test_user_id',
      name: 'Test User',
      email: 'user@urbancart.com',
      password: userPassword,
      role: 'user'
    };

    // Update memory
    users.push(adminUser);
    users.push(testUser);

    // Update DB
    await DBUser.create(adminUser);
    await DBUser.create(testUser);
    
    console.log('In-memory users and SQLite user database initialized successfully.');
  }
};

// Database synchronizer
const initializeUsersStore = async () => {
  try {
    // Sync models with database
    await sequelize.sync();
    
    isSyncing = true;
    
    // Load Users from DB
    const dbUsers = await DBUser.findAll();
    users.length = 0;
    dbUsers.forEach(u => users.push(u.get({ plain: true })));
    
    // Load Products from DB
    const dbProducts = await DBProduct.findAll();
    products.length = 0;
    dbProducts.forEach(p => {
      const prod = p.get({ plain: true });
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
    const dbCarts = await DBCartItem.findAll();
    Object.keys(carts).forEach(key => delete carts[key]);
    dbCarts.forEach(item => {
      const cartItem = item.get({ plain: true });
      if (!carts[cartItem.userId]) {
        carts[cartItem.userId] = [];
      }
      carts[cartItem.userId].push({
        productId: cartItem.productId,
        quantity: cartItem.quantity
      });
    });

    // Load Orders from DB
    const dbOrders = await DBOrder.findAll();
    const dbOrderItems = await DBOrderItem.findAll();
    orders.length = 0;
    dbOrders.forEach(o => {
      const order = o.get({ plain: true });
      if (order.shippingDetails) {
        try {
          order.shippingDetails = JSON.parse(order.shippingDetails);
        } catch (e) {
          order.shippingDetails = {};
        }
      }
      order.products = dbOrderItems
        .filter(item => item.orderId === order.id)
        .map(item => {
          const plainItem = item.get({ plain: true });
          return {
            productId: plainItem.productId,
            title: plainItem.title,
            price: plainItem.price,
            quantity: plainItem.quantity,
            image: plainItem.image
          };
        });
      orders.push(order);
    });

    isSyncing = false;

    console.log('Database synced & cache populated successfully.');

    // Seed default admin/user if none exist
    await initializeUsers();
  } catch (err) {
    isSyncing = false;
    console.error('Error synchronizing database schema:', err);
  }
};

// Users functions
export const getUserByEmail = (email) => {
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
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
  
  // Sync DB in background
  DBUser.create(newUser).catch(err => console.error('DB Error creating user:', err));

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
  
  // Sync DB in background
  DBProduct.create({
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
  
  // Sync DB in background
  DBProduct.update({
    title: updatedProduct.title,
    description: updatedProduct.description,
    price: updatedProduct.price,
    category: updatedProduct.category,
    image: updatedProduct.image,
    stock: updatedProduct.stock
  }, {
    where: { id: String(id) }
  }).catch(err => console.error('DB Error updating product:', err));

  return updatedProduct;
};

export const deleteProduct = (id) => {
  const index = products.findIndex(p => String(p.id) === String(id));
  if (index === -1) return false;
  
  // Sync Memory
  products.splice(index, 1);
  
  // Sync DB in background
  DBProduct.destroy({
    where: { id: String(id) }
  }).catch(err => console.error('DB Error deleting product:', err));

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
  
  // Sync DB in background (clear existing and bulk create)
  DBCartItem.destroy({ where: { userId } })
    .then(() => {
      if (normalizedItems.length > 0) {
        return DBCartItem.bulkCreate(normalizedItems.map(item => ({
          userId,
          productId: item.productId,
          quantity: item.quantity
        })));
      }
    })
    .catch(err => console.error('DB Error saving cart:', err));

  return carts[userId];
};

export const clearCart = (userId) => {
  // Sync Memory
  carts[userId] = [];
  
  // Sync DB in background
  DBCartItem.destroy({ where: { userId } })
    .catch(err => console.error('DB Error clearing cart:', err));

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
  
  // Sync DB in background
  DBOrder.create({
    id: newOrder.id,
    userId: newOrder.userId,
    subtotal: newOrder.subtotal,
    shippingFee: newOrder.shippingFee,
    tax: newOrder.tax,
    discount: newOrder.discount,
    totalAmount: newOrder.totalAmount,
    shippingDetails: JSON.stringify(newOrder.shippingDetails),
    paymentMethod: newOrder.paymentMethod,
    orderStatus: newOrder.orderStatus,
    createdAt: newOrder.createdAt
  })
  .then(() => {
    return DBOrderItem.bulkCreate(newOrder.products.map(item => ({
      orderId: newOrder.id,
      productId: item.productId,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    })));
  })
  .catch(err => console.error('DB Error creating order:', err));

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

// Export initializeUsers for compatibility, but map it to our DB load function
const initializeUsersExport = initializeUsersStore;

export { users, products, carts, orders, initializeUsersExport as initializeUsers };
