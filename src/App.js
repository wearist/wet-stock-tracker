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

const categories = [
  "spirits",
  "wines",
  "bottles",
  "softs",
  "barrels",
  "postmix",
];

function App() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("spirits");
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    threshold: "",
    category: "spirits",
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [viewTab, setViewTab] = useState("stock");
  const [searchTerm, setSearchTerm] = useState("");

  const itemsRef = collection(db, "items");

  useEffect(() => {
    const loadData = async () => {
      const data = await getDocs(itemsRef);
      const firebaseItems = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
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
    if (!newItem.name || !newItem.quantity || !newItem.threshold) return;

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
      category: category,
    });
    setEditingIndex(null);
    setSearchTerm("");
  };

  const handleEdit = (index) => {
    setNewItem(items[index]);
    setEditingIndex(index);
    setViewTab("stock");
  };

  const handleDelete = async (index) => {
    const item = items[index];
    if (window.confirm(`Delete "${item.name}"?`)) {
      if (item.id) {
        await deleteDoc(doc(db, "items", item.id));
      }
      const updated = items.filter((_, i) => i !== index);
      setItems(updated);
    }
  };

  const filteredItems = items.filter((item) => item.category === category);
  const shoppingItems = items.filter(
    (item) => parseFloat(item.quantity) <= parseFloat(item.threshold)
  );

  const handleSearchSelect = (item) => {
    setNewItem(item);
    setEditingIndex(items.indexOf(item));
    setSearchTerm("");
    setViewTab("stock");
  };

  return (
    <div className="app-container">
      <img src={logo} alt="Logo" className="logo" />

      <div className="tabs">
        <button
          onClick={() => setViewTab("stock")}
          className={viewTab === "stock" ? "active smart-button" : "smart-button"}
        >
          Stock
        </button>
        <button
          onClick={() => setViewTab("shopping")}
          className={viewTab === "shopping" ? "active smart-button" : "smart-button"}
        >
          Shopping List
        </button>
      </div>

      {viewTab === "stock" && (
        <div className="content">

          <input
            type="text"
            placeholder="Search item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <div className="item-list">
              {items
                .filter((i) =>
                  i.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((item, i) => (
                  <div key={i} className="item" onClick={() => handleSearchSelect(item)}>
                    <strong>{item.name}</strong>
                    <br />
                    Qty: {item.quantity}
                  </div>
                ))}
            </div>
          )}

          <div className="input-form">
            <input
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) =>
                setNewItem({ ...newItem, name: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem({ ...newItem, quantity: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Threshold"
              value={newItem.threshold}
              onChange={(e) =>
                setNewItem({ ...newItem, threshold: e.target.value })
              }
            />
            <select
              value={newItem.category}
              onChange={(e) =>
                setNewItem({ ...newItem, category: e.target.value })
              }
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button className="smart-button" onClick={handleAddOrUpdate}>
              {editingIndex !== null ? "Update" : "Add Item"}
            </button>
          </div>

          <div className="category-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={
                  category === cat ? "active smart-button" : "smart-button"
                }
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="item-list">
            {filteredItems.map((item, i) => (
              <div key={i} className="item">
                <strong>{item.name}</strong>
                <br />
                Qty: {item.quantity}, Threshold: {item.threshold}
                <br />
                <button className="smart-button" onClick={() => handleEdit(i)}>✏️ Edit</button>
                <button className="smart-button" onClick={() => handleDelete(i)}>🗑️ Delete</button>
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
              {shoppingItems
                .filter((i) => i.category === cat)
                .map((item, i) => (
                  <div key={i} className="item">
                    <strong>{item.name}</strong>
                    <br />
                    Qty: {item.quantity}, Threshold: {item.threshold}
                    <br />
                    <button className="smart-button" onClick={() => handleEdit(items.indexOf(item))}>
                      ✏️ Edit
                    </button>
                    <button className="smart-button" onClick={() => handleDelete(items.indexOf(item))}>
                      🗑️ Delete
                    </button>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
