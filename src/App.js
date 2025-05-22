// App.js
import React, { useState, useEffect } from "react";
import "./App.css";
import logo from "./logo.png";

const categories = ["Dry", "Fresh", "Frozen", "Dessert"];

function App() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("Dry");
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    threshold: "",
    expiry: "",
    category: "Dry"
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [viewTab, setViewTab] = useState("stock");

  useEffect(() => {
    const stored = localStorage.getItem("items");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  const handleAddOrUpdate = () => {
    if (!newItem.name || !newItem.quantity || !newItem.threshold || !newItem.expiry) return;
    const updated = [...items];
    if (editingIndex !== null) {
      updated[editingIndex] = newItem;
    } else {
      updated.push(newItem);
    }
    setItems(updated);
    setNewItem({ name: "", quantity: "", threshold: "", expiry: "", category: "Dry" });
    setEditingIndex(null);
  };

  const handleEdit = (index) => {
    setNewItem(items[index]);
    setEditingIndex(index);
  };

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const filteredItems = items.filter((item) => item.category === category);
  const shoppingItems = items.filter((item) => parseFloat(item.quantity) <= parseFloat(item.threshold));
  const expiringItems = items.filter((item) => {
    const itemDate = new Date(item.expiry);
    return (
      itemDate.toDateString() === today.toDateString() ||
      itemDate.toDateString() === tomorrow.toDateString()
    );
  });

  return (
    <div className="app-container">
      <img src={logo} alt="Logo" className="logo" />

      <div className="tabs">
        <button onClick={() => setViewTab("stock")} className={viewTab === "stock" ? "active" : ""}>Stock</button>
        <button onClick={() => setViewTab("shopping")} className={viewTab === "shopping" ? "active" : ""}>Shopping List</button>
        <button onClick={() => setViewTab("expiry")} className={viewTab === "expiry" ? "active" : ""}>Expiry</button>
      </div>

      {viewTab === "stock" && (
        <div className="content">
          <div className="input-form">
            <input type="text" placeholder="Item name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
            <input type="number" placeholder="Quantity" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} />
            <input type="number" placeholder="Threshold" value={newItem.threshold} onChange={(e) => setNewItem({ ...newItem, threshold: e.target.value })} />
            <input type="date" value={newItem.expiry} onChange={(e) => setNewItem({ ...newItem, expiry: e.target.value })} />
            <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button onClick={handleAddOrUpdate}>{editingIndex !== null ? "Update" : "Add Item"}</button>
          </div>

          <div className="category-tabs">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)} className={category === cat ? "active" : ""}>{cat}</button>
            ))}
          </div>

          <div className="item-list">
            {filteredItems.map((item, i) => (
              <div key={i} className="item" onClick={() => handleEdit(i)}>
                <strong>{item.name}</strong><br />
                Qty: {item.quantity}, Threshold: {item.threshold}, Expiry: {item.expiry}
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
                <div key={i} className="item" onClick={() => handleEdit(items.indexOf(item))}>
                  <strong>{item.name}</strong><br />
                  Qty: {item.quantity}, Threshold: {item.threshold}
                </div>
              ))}
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
                <div key={i} className="item" onClick={() => handleEdit(items.indexOf(item))}>
                  <strong>{item.name}</strong><br />
                  Expiry: {item.expiry}, Qty: {item.quantity}
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
