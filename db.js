import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC21ZFlX8zFqFvW6hUlKUlVEE0VPfL_fuc",
  authDomain: "trijal-ae6cb.firebaseapp.com",
  projectId: "trijal-ae6cb",
  storageBucket: "trijal-ae6cb.firebasestorage.app",
  messagingSenderId: "131286839161",
  appId: "1:131286839161:web:c0c1fc89b38ec2705649a8",
  measurementId: "G-B0DJLLF8BY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Seed data
const defaultProducts = [
    {
        id: "p1",
        name: "Wood-Pressed Groundnut Oil",
        image: "assets/images/product_groundnut.png",
        hover_info: ["Rich in Vitamin E", "Zero Trans Fat", "Perfect for Indian Cooking"],
        desc: "Nutty aroma, ideal for deep frying and everyday cooking.",
        sizes: [
            { size: "500ml", price: 299 },
            { size: "1L", price: 549, selected: true },
            { size: "5L", price: 2599 }
        ]
    },
    {
        id: "p2",
        name: "Wood-Pressed Sesame Oil",
        image: "assets/images/product_sesame.png",
        hover_info: ["High in Antioxidants", "Heart Healthy", "Great for Skin & Hair"],
        desc: "Deep, rich flavor. Excellent for cooking and Ayurvedic practices.",
        sizes: [
            { size: "500ml", price: 349 },
            { size: "1L", price: 649, selected: true },
            { size: "5L", price: 3100 }
        ]
    },
    {
        id: "p3",
        name: "Wood-Pressed Coconut Oil",
        image: "",
        hover_info: ["MCT Rich", "Boosts Metabolism", "Multi-purpose Oil"],
        desc: "Sweet tropical aroma. Perfect for baking, cooking, and skincare.",
        sizes: [
            { size: "500ml", price: 249 },
            { size: "1L", price: 479, selected: true },
            { size: "5L", price: 2299 }
        ]
    }
];

export async function getAllProducts() {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        let products = [];
        querySnapshot.forEach((doc) => {
            products.push(doc.data());
        });
        
        // If DB is empty, seed it
        if (products.length === 0) {
            for (const p of defaultProducts) {
                await saveProduct(p);
                products.push(p);
            }
        }
        return products;
    } catch (e) {
        console.error("Error fetching products: ", e);
        return [];
    }
}

export async function saveProduct(product) {
    try {
        await setDoc(doc(db, "products", product.id), product);
        return true;
    } catch (e) {
        console.error("Error saving product: ", e);
        throw e;
    }
}

export async function deleteProduct(id) {
    try {
        await deleteDoc(doc(db, "products", id));
        return true;
    } catch (e) {
        console.error("Error deleting product: ", e);
        throw e;
    }
}
