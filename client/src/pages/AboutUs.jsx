import React from "react";
import { Link } from "react-router-dom";
import { Button } from "flowbite-react";

const AboutUsPage = () => {
  // Dummy data for team members with placeholder images
  const teamMembers = [
    {
      name: "Hannah Dylene Restauro",
      role: "Project Leader",
      image: "/placeholders/hannah.jpg",
    },
    {
      name: "Marc Denisse Avila",
      role: "Full Stack Developer",
      image: "/placeholders/denisse.png",
    },
    {
      name: "Adrian Claude Babatid",
      role: "Full Stack Developer",
      image: "/placeholders/claude.jpg",
    },
    {
      name: "John Joshua Jallorina",
      role: "Full Stack Developer",
      image: "/placeholders/joshua.jpg",
    },
    {
      name: "John Gabriele Palo",
      role: "Full Stack Developer",
      image: "/placeholders/John.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-red-50 dark:from-gray-700 dark:to-gray-900 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-6xl text-center">
        <h1 className="mt-6 text-3xl sm:text-5xl font-bold text-gray-800 dark:text-white">
          About the Project
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg sm:text-xl">
          FindNest is a capstone project proposed by a dedicated group of Third
          Year Bachelor of Science in Information Technology students from Cebu
          Institute of Technology University. The project is designed with the
          primary goal of enhancing the efficiency and effectiveness of the lost
          and found item management systems within the university's offices.
        </p>
        <div id="team" className="mt-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-red-500 dark:text-red-300">
            The Developers
          </h2>
          <div className="flex flex-wrap justify-center items-center mt-6 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="bg-white dark:bg-gray-700 shadow-2xl rounded-xl overflow-hidden w-80 transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <img
                  src={member.image}
                  alt={`${member.name}`}
                  className="w-full h-60 object-cover"
                />
                <div className="p-6">
                  <div className="font-bold text-xl mb-2 text-gray-800 dark:text-white">
                    {member.name}
                  </div>
                  <p className="text-red-500 dark:text-red-300 text-sm">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
