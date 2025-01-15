import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaFileAlt, FaFileUpload, FaChartLine, FaFolder } from "react-icons/fa"; // Import icons
import image1 from "../images/1.jpg";
import image2 from "../images/2.jpg";
import image3 from "../images/5.jpg";
import image4 from "../images/6.jpg"

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt /> },
  { name: "Test Grader", path: "/test-grader", icon: <FaFileUpload /> },
  { name: "Mini Test", path: "/mini-test", icon: <FaFileAlt /> },
  { name: "Documents", path: "/documents", icon: <FaFolder /> },
  { name: "Progress Tracker", path: "/progress", icon: <FaChartLine /> },
];

const features = [
  {
    title: "Test Grader",
    image: image1,
    description:
      "Automatically grade tests with accuracy and efficiency. Save time and focus on what matters most.",
    path: "/test-grader",
  },
  {
    title: "Mini Test Generator",
    image: image2,
    description:
      "Create custom mini tests tailored to your needs. Choose difficulty levels and question types.",
    path: "/mini-test",
  },
  {
    title: "Progress Tracker",
    image: image3,
    description:
      "Track your learning progress and identify areas for improvement with detailed analytics.",
    path: "/progress",
  },
  {
    title: "Document Tracker",
    image: image4,
    description:
      "Track your uploaded documents with ease.",
    path: "/documents",
  },
];

function MainPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    const currentItem = menuItems.find((item) => item.path === location.pathname);
    if (currentItem) setActiveTab(currentItem.name);
  }, [location.pathname]);

  const handleNavigation = (path) => navigate(path);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-black text-white p-6 border-r border-gray-700 flex-shrink-0">
        <h1 className="text-3xl font-bold mb-12 text-center text-red-500">Study Buddy</h1>
        <nav>
          <ul className="space-y-8"> {/* Increased spacing */}
            {menuItems.map((item) => (
              <li key={item.name}>
                <div
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer ${
                    activeTab === item.name
                      ? "bg-red-500 text-black"
                      : "hover:bg-gray-800 hover:text-red-500"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 relative">
        {/* Log Out Button */}
        <div className="absolute top-6 right-6">
          <button
            className="px-6 py-2 bg-red-500 text-black font-semibold rounded-lg hover:bg-red-600 transition"
            onClick={() => handleNavigation("/")}
          >
            Log Out
          </button>
        </div>

        {/* Header */}
        <header className="mb-12 text-center">
          <h2 className="text-4xl font-bold">Welcome to Study Buddy</h2>
          <p className="text-gray-400 mt-2 text-lg">Explore your tools and resources</p>
        </header>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row bg-gray-900 rounded-lg shadow-xl overflow-hidden border border-gray-800 transform hover:-translate-y-1 hover:shadow-2xl transition duration-300"
            >
              {/* Image */}
              <div
                className="w-full md:w-1/2 h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${feature.image})` }}
              ></div>

              {/* Text */}
              <div className="w-full md:w-1/2 p-6 text-center md:text-left">
                <h3 className="text-2xl font-bold text-red-500 mb-3">{feature.title}</h3>
                <p className="text-gray-300 font-semibold mb-4">{feature.description}</p>
                <button
                  className="px-4 py-2 bg-red-500 text-black font-semibold rounded-lg hover:bg-red-600 transition transform hover:scale-105"
                  onClick={() => handleNavigation(feature.path)}
                >
                  Explore More
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default MainPage;