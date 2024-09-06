import React from "react";
import {
  FaRocket,
  FaTools,
  FaUsers,
  FaSearch,
  FaChartLine,
  FaShieldAlt,
} from "react-icons/fa";

const styles = {
  icon: {
    color: "#F87171", // Red color for icons
    marginBottom: "0.5rem",
    height: "3rem", // Icon size
    width: "3rem", // Icon size
    borderRadius: "50%", // Rounded corners for the icons
    backgroundColor: "#FEE2E2", // Light red background for icons
    padding: "0.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s",
  },
  title: {
    color: "#1F2937",
    marginBottom: "0.5rem",
    fontSize: "1.5rem", // Increased font size
    fontWeight: "bold",
  },
  description: {
    color: "#6B7280",
    marginBottom: "1rem",
    fontSize: "1.125rem", // Increased font size
  },
  card: {
    padding: "1.5rem",
    textAlign: "left",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
    borderRadius: "1rem",
    backgroundImage: "linear-gradient(to right, #ffffff, #f9fafb)", // Gradient background
    transition: "transform 0.3s, box-shadow 0.3s",
    display: "flex",
    alignItems: "center",
    marginBottom: "1.5rem",
    overflow: "hidden",
    position: "relative",
    border: "1px solid #E5E7EB",
  },
  cardHover: {
    transform: "translateY(-10px)",
    boxShadow: "0 12px 20px rgba(0, 0, 0, 0.2)",
  },
  cardBefore: {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("/path-to-your-pattern-image.png")',
    opacity: 0.1,
    zIndex: 0,
  },
  content: {
    marginLeft: "1rem",
    zIndex: 1, // Ensure content is above background pattern
  },
  footer: {
    backgroundColor: "#1F2937",
    color: "#FFFFFF",
    padding: "2rem",
    marginTop: "2rem",
    textAlign: "center",
  },
  footerText: {
    marginBottom: "0.5rem",
    fontSize: "1.25rem",
  },
  footerLink: {
    color: "#F87171",
    textDecoration: "none",
    fontWeight: "bold",
  },
};

const FeatureCard = ({ Icon, title, description }) => {
  return (
    <div
      className="hover:transform hover:-translate-y-2 hover:shadow-2xl transition-transform duration-300 relative"
      style={styles.card}
    >
      <div style={styles.cardBefore}></div>
      <div style={styles.icon}>
        <Icon size="1.5rem" /> {/* Icon size set to 1.5rem */}
      </div>
      <div style={styles.content}>
        <h5 style={styles.title}>{title}</h5>
        <p style={styles.description}>{description}</p>
      </div>
    </div>
  );
};

export default function Features() {
  const features = [
    {
      Icon: FaRocket,
      title: "Item Reporting",
      description:
        "Report found items quickly with our user-friendly interfaces. Our system allows you to report items efficiently, ensuring they are cataloged and managed promptly.",
    },
    {
      Icon: FaTools,
      title: "Item Management",
      description:
        "Manage all reported items efficiently with our comprehensive tools. Our management system provides an easy-to-use interface for tracking and updating item statuses.",
    },
    {
      Icon: FaUsers,
      title: "User Collaboration",
      description:
        "Collaborate with your team in real-time with secure role-based access. Ensure smooth communication and coordination within your team to handle items effectively.",
    },
    {
      Icon: FaSearch,
      title: "Search Functionality",
      description:
        "Quickly find found items with our implemented search functionality",
    },
    {
      Icon: FaChartLine,
      title: "Analytics",
      description: "Gain insights with our detailed analytics tools.",
    },
    {
      Icon: FaShieldAlt,
      title: "Security",
      description:
        "Keep your data safe with our advanced security features. We ensure your information is protected with state-of-the-art technology.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-red-50 dark:from-gray-700 dark:to-gray-900 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-6xl text-center">
        <h2 className="mt-6 text-3xl sm:text-5xl font-bold text-gray-800 dark:text-white">
          Explore Our Features
        </h2>
        <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg sm:text-xl">
          Discover how our tools and technologies enhance your operational
          efficiency.
        </p>
        <div className="mt-20 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
}
