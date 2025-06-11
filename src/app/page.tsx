"use client";

import { useState } from "react";

export default function POSPage() {
  const [code, setCode] = useState("");
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [list, setList] = useState([]);
  const [quantities, setQuantities] = useState({});

  const handleRead = async () => {
    console.log("🛠 handleRead called");
    console.log("📦 入力されたコード:", code);
  
    try {
      const res = await fetch(`http://localhost:8000/product?code=${code}`);
      console.log("📡 レスポンス status:", res.status);
  
      if (!res.ok) throw new Error("商品が見つかりません");
      const data = await res.json();
      console.log("📦 商品データ:", data);
  
      setProduct(data);
      setError("");
    } catch (err) {
      console.error("❌ 検索エラー:", err);
      setProduct(null);
      setError("商品マスタ未登録です");
    }
  };

  const handleAdd = () => {
    if (product) {
      const existing = list.find((item) => item.CODE === product.CODE);
      if (!existing) {
        setList([...list, product]);
        setQuantities({ ...quantities, [product.CODE]: 1 });
      } else {
        setQuantities({
          ...quantities,
          [product.CODE]: quantities[product.CODE] + 1,
        });
      }
      setProduct(null);
      setCode("");
    }
  };

  const handleQuantity = (code, delta) => {
    const newQty = (quantities[code] || 0) + delta;
    if (newQty <= 0) {
      setList(list.filter((item) => item.CODE !== code));
      const { [code]: _, ...rest } = quantities;
      setQuantities(rest);
    } else {
      setQuantities({ ...quantities, [code]: newQty });
    }
  };

  const handlePurchase = async () => {
    const products = list.map((item) => ({
      ...item,
      quantity: quantities[item.CODE],
    }));
    const payload = {
      emp_cd: "9999999999",
      products: products.flatMap((p) => Array(p.quantity).fill(p)),
    };
    const res = await fetch("http://localhost:8000/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    alert(`🧾 ご注文ありがとうございました！\n合計金額: ￥${data.total_amount} 円`);
    setList([]);
    setQuantities({});
  };

  const handleRemove = (code) => {
    setList(list.filter((item) => item.CODE !== code));
    const { [code]: _, ...rest } = quantities;
    setQuantities(rest);
  };
  

  const total = list.reduce((sum, item) => sum + item.PRICE * (quantities[item.CODE] || 0), 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">TEST</h1>

      <div className="bg-gray-800 p-4 rounded shadow space-y-3">
        <label className="block font-semibold">商品コード入力</label>
        <input
          type="text"
          className="border-2 border-gray-600 focus:border-blue-400 bg-gray-100 text-black p-3 rounded w-full text-lg"
          placeholder="例: TE01234"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          onClick={handleRead}
          className="bg-blue-500 hover:opacity-90 text-white font-semibold py-2 px-4 rounded w-full"
        >
          商品検索
        </button>
        {error && <p className="text-red-400">{error}</p>}
      </div>

      {product && (
  <div className="bg-gray-800 p-4 rounded shadow space-y-2">
    <div className="text-lg font-semibold">商品情報</div>
    <div>名称: {product.NAME}</div>
    <div>価格: ￥{product.PRICE}</div>
    <button
      onClick={handleAdd}
      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full mt-2"
    >
      カゴに追加
    </button>
  </div>
)}
      
      <div className="bg-gray-800 p-4 rounded shadow space-y-4">
        <h2 className="font-bold text-lg">買い物カゴ</h2>
        {list.map((item) => (
          <div
            key={item.CODE}
            className="bg-gray-700 p-3 rounded flex flex-col space-y-2 text-sm"
          >
      
          

            <div className="font-semibold text-base">{item.NAME}</div>
            
          

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span>数量:</span>
                <button
                  onClick={() => handleQuantity(item.CODE, -1)}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5"
                >
                  
                  
                  −
                </button>
                <span className="font-bold text-white">{quantities[item.CODE] || 0}</span>
                <button
                  onClick={() => handleQuantity(item.CODE, 1)}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-full w-5 h-5"
                >
                  ＋
                </button>
              </div>
              <div>
                単価: ￥{item.PRICE}
              </div>
              <button
      onClick={() => handleRemove(item.CODE)}
      className="text-red-500 font-bold text-sm ml-2"
      title="カゴから削除"
    >
      カゴから削除
    </button>
            </div>
            <div className="text-right font-semibold">
              小計: ￥{item.PRICE * (quantities[item.CODE] || 0)}
            </div>
          </div>
        ))}
      </div>

      

      <div className="bg-gray-800 p-4 rounded shadow text-center">
        <h2 className="text-lg font-bold mb-2">お支払額</h2>
        <p className="text-2xl text-red-500">￥{total}</p>
      </div>

      <button
        onClick={handlePurchase}
        disabled={list.length === 0}
        className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded w-full text-lg font-bold"
      >
        注文
      </button>
    </div>
  );
}
