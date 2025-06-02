// App.js
import React, { useState, useEffect } from "react";
import "./App.css";
import logo from "./logo.png";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import BarcodeScanner from "./BarcodeScanner";

const categories = ["Dry", "Fresh", "Frozen", "Dessert"];

function App() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("Dry");
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    threshold: "",
    expiry: "",
    category: "Dry",
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [viewTab, setViewTab] = useState("stock");
  const [scanning, setScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const itemsRef = collection(db, "items");

  useEffect(() => {
    const loadData = async () => {
      const data = await getDocs(itemsRef);
      const firebaseItems = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setItems(firebaseItems);
      localStorage.setItem("items", JSON.stringify(firebaseItems));
    };

    const stored = localStorage.getItem("items");
    if (stored) {
      setItems(JSON.parse(stored));
    }
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  const handleAddOrUpdate = async () => {
    if (!newItem.name || !newItem.quantity || !newItem.threshold || !newItem.expiry)
      return;

    let updated = [...items];

    if (editingIndex !== null) {
      const updatedItem = { ...newItem };
      const id = items[editingIndex].id;
      if (id) {
        const itemDoc = doc(db, "items", id);
        await updateDoc(itemDoc, updatedItem);
        updated[editingIndex] = { ...updatedItem, id };
      } else {
        updated[editingIndex] = newItem;
      }
    } else {
      const docRef = await addDoc(itemsRef, newItem);
      updated.push({ ...newItem, id: docRef.id });
    }

    setItems(updated);
    setNewItem({
      name: "",
      quantity: "",
      threshold: "",
      expiry: "",
      category: "Dry",
    });
    setEditingIndex(null);
    setSearchTerm("");
  };

  const handleEdit = (index) => {
    setNewItem(items[index]);
    setEditingIndex(index);
    setSearchTerm("");
  };

  const handleDelete = async (index) => {
    const item = items[index];
    if (window.confirm(`Delete "${item.name}"?`)) {
      if (item.id) {
        await deleteDoc(doc(db, "items", item.id));
      }
      const updated = items.filter((_, i) => i !== index);
      setItems(updated);
      if (editingIndex === index) {
        setNewItem({
          name: "",
          quantity: "",
          threshold: "",
          expiry: "",
          category: "Dry",
        });
        setEditingIndex(null);
      }
    }
  };

  const handleScanComplete = async ({ barcode, expiry }) => {
    setScanning(false);

    if (barcode) {
      try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        const data = await res.json();
        if (data.status === 1 && data.product.product_name) {
          setNewItem((prev) => ({
            ...prev,
            name: data.product.product_name,
            quantity: prev.quantity || "1",
          }));
        } else {
          alert("Product not found in Open Food Facts.");
        }
      } catch {
        alert("Error fetching product info.");
      }
    }

    if (expiry) {
      setNewItem((prev) => ({
        ...prev,
        expiry,
      }));
    }
  };

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const filteredItems = items.filter((item) => item.category === category);
  const shoppingItems = items.filter(
    (item) => parseFloat(item.quantity) <= parseFloat(item.threshold)
  );
  const expiringItems = items.filter((item) => {
    const itemDate = new Date(item.expiry);
    return (
      itemDate.toDateString() === today.toDateString() ||
      itemDate.toDateString() === tomorrow.toDateString()
    );
  });

  // Search filtered by category
  const searchedItems = filteredItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // On search, automatically populate newItem with first matched result for quick update
  useEffect(() => {
    if (searchTerm.trim() === "") return;
    const found = searchedItems[0];
    if (found) {
      setNewItem(found);
      setEditingIndex(items.findIndex(i => i.id === found.id));
    }
  }, [searchTerm]);

  return (
    <div className="app-container">
      <img src={logo} alt="Logo" className="logo" />

      <div className="tabs">
        <button
          onClick={() => setViewTab("stock")}
          className={viewTab === "stock" ? "tab active" : "tab"}
        >
          Stock
        </button>
        <button
          onClick={() => setViewTab("shopping")}
          className={viewTab === "shopping" ? "tab active" : "tab"}
        >
          Shopping List
        </button>
        <button
          onClick={() => setViewTab("expiry")}
          className={viewTab === "expiry" ? "tab active" : "tab"}
        >
          Expiry
        </button>
      </div>

      {viewTab === "stock" && (
        <div className="content">
          {scanning && (
            <BarcodeScanner
              onScanComplete={handleScanComplete}
              onClose={() => setScanning(false)}
            />
          )}

          <button onClick={() => setScanning(true)}>📷 Scan Barcode + Expiry</button>

          <div className="input-form">
            <input
              type="text"
              placeholder="Search items to auto-load"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
            />
            <input
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            />
            <input
              type="number"
              placeholder="Threshold"
              value={newItem.threshold}
              onChange={(e) => setNewItem({ ...newItem, threshold: e.target.value })}
            />
            <input
              type="date"
              value={newItem.expiry}
              onChange={(e) => setNewItem({ ...newItem, expiry: e.target.value })}
            />
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button onClick={handleAddOrUpdate}>
              {editingIndex !== null ? "Update" : "Add Item"}
            </button>
          </div>

          <div className="category-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setSearchTerm("");
                  setNewItem({
                    name: "",
                    quantity: "",
                    threshold: "",
                    expiry: "",
                    category: cat,
                  });
                  setEditingIndex(null);
                }}
                className={category === cat ? "tab active" : "tab"}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="item-list">
            {searchedItems.map((item, i) => (
              <div key={item.id} className="item">
                <strong>{item.name}</strong><br />
                Qty: {item.quantity}, Threshold: {item.threshold}, Expiry: {item.expiry}<br />
                <button onClick={() => handleEdit(items.findIndex(i => i.id === item.id))}>✏️ Edit</button>
                <button onClick={() => handleDelete(items.findIndex(i => i.id === item.id))}>🗑️ Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewTab === "shopping" && (
        <div className="tabbed-category-view">
          {categories.map((cat) => (
            <div key={cat} className="category-section">
              <h3>{cat}</h3>
              {shoppingItems.filter(i => i.category === cat).map((item, i) => (
                <div key={item.id} className="item">
                  <strong>{item.name}</strong><br />
                  Qty: {item.quantity}, Threshold: {item.threshold}<br />
                  <button onClick={() => handleEdit(items.findIndex(i => i.id === item.id))}>✏️ Edit</button>
                  <button onClick={() => handleDelete(items.findIndex(i => i.id === item.id))}>🗑️ Delete</button>
                </div>
              ))}
              {shoppingItems.filter(i => i.category === cat).length === 0 && <p>No items low on stock.</p>}
            </div>
          ))}
        </div>
      )}

      {viewTab === "expiry" && (
        <div className="tabbed-category-view">
          {categories.map((cat) => (
            <div key={cat} className="category-section">
              <h3>{cat}</h3>
              {expiringItems.filter(i => i.category === cat).map((item, i) => (
                <div key={item.id} className="item">
                  <strong>{item.name}</strong><br />
                  Expiry: {item.expiry}<br />
                  <button onClick={() => handleEdit(items.findIndex(i => i.id === item.id))}>✏️ Edit</button>
                  <button onClick={() => handleDelete(items.findIndex(i => i.id === item.id))}>🗑️ Delete</button>
                </div>
              ))}
              {expiringItems.filter(i => i.category === cat).length === 0 && <p>No items expiring soon.</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
