import { useState } from "react";
import "./ChatInterface.css";

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sender, setSender] = useState("Student");

  const sendMessage = async () => {
    if (input.trim() !== "") {
      setMessages([...messages, { text: input, sender }]);
      setInput("");
      
      try {
        const response = await fetch("https://api.example.com/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sender, message: input })
        });
        
        const data = await response.json();
        setMessages((prev) => [...prev, { text: data.reply, sender: data.sender }]);
      } catch (error) {
        setMessages((prev) => [...prev, { text: "Error fetching response", sender: "System" }]);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 border rounded-lg shadow-lg bg-white">
      <div className="h-96 overflow-y-auto p-3 border-b">
        {messages.map((msg, index) => (
          <div key={index} className={`p-3 my-2 rounded ${msg.sender === "Student" ? "bg-green-200 text-right" : "bg-gray-200 text-left"}`}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="flex mt-3">
        <select className="p-3 border rounded-l bg-white" value={sender} onChange={(e) => setSender(e.target.value)}>
          <option value="Student">Student</option>
          <option value="Mentor">Mentor</option>
        </select>
        <input
          type="text"
          className="flex-grow p-3 border"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="p-3 bg-green-500 text-white rounded-r">Send</button>
      </div>
    </div>
  );
}
