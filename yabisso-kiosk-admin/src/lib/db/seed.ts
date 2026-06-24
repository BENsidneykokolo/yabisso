import { database } from './index';
import Product from './models/Product';
import WalletTransaction from './models/WalletTransaction';
import LobaPost from './models/LobaPost';

export const seedDatabase = async () => {
  const productsCollection = database.get<Product>('products');
  const count = await productsCollection.query().fetchCount();

  if (count === 0) {
    await database.write(async () => {
      const initialProducts = [
        { name: 'iPhone 15 Pro Max', brand: 'Apple', price: '950000', is_new: true, category: 'Téléphones' },
        { name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', price: '780000', is_new: true, category: 'Téléphones' },
        { name: 'Air Zoom Pegasus', brand: 'Nike', price: '65000', is_new: false, category: 'Mode' },
        { name: 'Galaxy Watch 5', brand: 'Samsung', price: '120000', is_new: true, category: 'Accessoire' },
        { name: 'MacBook Pro M3', brand: 'Apple', price: '1200000', is_new: true, category: 'Téléphones' },
        { name: 'Nike Air Max 2024', brand: 'Nike', price: '85000', is_new: true, category: 'Mode' },
        { name: 'Xiaomi 14 Ultra', brand: 'Xiaomi', price: '650000', is_new: false, category: 'Téléphones' },
        { name: 'Sony WH-1000XM5', brand: 'Sony', price: '180000', is_new: true, category: 'Accessoire' },
        { name: 'iPad Pro M4', brand: 'Apple', price: '950000', is_new: true, category: 'Téléphones' },
        { name: 'Samsung TV 55"', brand: 'Samsung', price: '350000', is_new: false, category: 'Maison' },
        { name: 'AirPods Pro', brand: 'Apple', price: '95000', is_new: true, category: 'Accessoire' },
        { name: 'Apple Watch Ultra 2', brand: 'Apple', price: '450000', is_new: true, category: 'Accessoire' },
      ];

      for (const p of initialProducts) {
        await productsCollection.create(product => {
          product.name = p.name;
          product.brand = p.brand;
          product.price = p.price;
          product.category = p.category;
          product.isNew = p.is_new;
          product.imageUrl = '';
          product.description = '';
          product.minPrice = '0';
          product.stock = 0;
          product.photosJson = '[]';
          product.condition = 'neuf';
          product.colorsJson = '[]';
          product.sizesJson = '[]';
          product.tagsJson = '[]';
          product.sellerId = '';
          product.sellerName = '';
          product.isValidated = false;
          product.productSyncStatus = 'local';
        });
      }
    });
  }

  const transactionsCollection = database.get<WalletTransaction>('wallet_transactions');
  const txCount = await transactionsCollection.query().fetchCount();
  if (txCount === 0) {
    await database.write(async () => {
      const initialTxs = [
        { title: 'Recharge', meta: "Aujourd'hui · Mobile Money", amount: '+15 000', is_positive: true, wallet_mode: 'fcfa' },
        { title: 'Paiement livraison', meta: 'Hier · Yabisso Delivery', amount: '-3 200', is_positive: false, wallet_mode: 'fcfa' },
        { title: 'Cashback', meta: 'Hier · Bonus', amount: '+450', is_positive: true, wallet_mode: 'fcfa' },
        { title: 'Recharge Points', meta: "Aujourd'hui · Achat Pack", amount: '+500', is_positive: true, wallet_mode: 'points' },
        { title: 'Utilisation Service', meta: 'Hier · Reservation', amount: '-200', is_positive: false, wallet_mode: 'points' },
        { title: 'Bonus Fidelite', meta: 'Hier · Programme', amount: '+50', is_positive: true, wallet_mode: 'points' },
      ];
      for (const tx of initialTxs) {
        await transactionsCollection.create(t => {
          t.title = tx.title;
          t.meta = tx.meta;
          t.amount = tx.amount;
          t.isPositive = tx.is_positive;
          t.walletMode = tx.wallet_mode;
        });
      }
    });
  }

  const lobaCollection = database.get<LobaPost>('loba_posts');
  const postCount = await lobaCollection.query().fetchCount();
  if (postCount === 0) {
    await database.write(async () => {
      const initialPosts = [
        {
          username: '@LagosEats',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-cZ953z6Pef-m-esMbutiujQzwcQ3gXocj0ErdwM9gmhxLpWo4SKz4VFvkSga_qlHMvvYo8Lkoex8tWespXnC8gKlURT7iGPPII63Uh98f-AX-ZYpjq5WOAHrL1QarS-bIe8awUnOztGtUDF19UvJerb2PYVsQUw5cJLRSU5yM8wnobwysn7cOF3j3h71OchJaZfAHWd1qNkkVk6oEEAlMw63bsadLjh3IsXVs3Db_jad-rzwr27E6XhAExYmUfH2A85zZ_Q7',
          content: 'Trying the best suya in the city! 🔥🥩 #Lagos #Foodie #Yabisso',
          likes: 1245,
          comments: 320,
          is_liked: false
        },
        {
          username: '@TechGhana',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpQKycPMLIcj6lEgT3yylEk1PYLRLRoGgntAftVcxpaZk_rZCjF9tJVB74QcDXaov6pXlQd0xJc3Hzn42A1xSh9sZDFM8PgyDRwaUsq2dn7Bf4d23hd1L-NEElMtyMOXIXKC3n95_TmtmOznJyFX7p_fI7-3ZxTpsj7scTO5mwqImoclkDwp9xyQN6RBUdjQBm_U_wSO1O_DvULR6bLmrYThfVtAvmsqTQJoZByFXdNIm-IThl8u4qx54KVUdJpCvlTLEejlGP',
          content: 'Building the future of African tech! 🌍✨ #AfricanTech #Innovation',
          likes: 4500,
          comments: 180,
          is_liked: true
        }
      ];
      for (const p of initialPosts) {
        await lobaCollection.create(post => {
          post.username = p.username;
          post.avatar = p.avatar;
          post.content = p.content;
          post.likes = p.likes;
          post.comments = p.comments;
          post.isLiked = p.is_liked;
        });
      }
    });
  }
};
