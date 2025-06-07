"use client";

import { useState } from "react";
import Modal from "../Modal"; // Adjust the path if needed

export default function LogoutHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleLoginSuccess = () => {
    setIsModalOpen(false);
  };

  return (
    <header className="h-[150px] w-full bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
            Duluth, Ga
          </button>
          <span className="text-blue-800 font-extrabold">with</span>
          <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
            Mauricia Engle
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
            Find an Agent
          </button>
          <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
            Contact Us
          </button>
          <button
            onClick={openModal}
            className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold"
          >
            Sign In
          </button>
        </div>
      </div>

      <div className="h-[1px] bg-blue-800 w-full"></div>

      <div className="flex-2 flex flex-col justify-center">
        <div className="flex justify-between items-center px-6">
          <div className="flex items-center space-x-4 lg:space-x-8">
            <img
              src="/amfam-logo.svg"
              alt="American Family Insurance Logo"
              className="h-[80px] w-auto mr-4"
            />
            <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
              Insurance
            </button>
            <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
              Claims
            </button>
            <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
              Customer Support
            </button>
            <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
              Resources
            </button>
          </div>

          <div className="flex space-x-4 items-center">
            <button className="flex items-center text-white bg-blue-800 hover:bg-blue-700 px-6 py-6 rounded-md font-extrabold">
              <img
                src="/messageicon.svg"
                alt="Message Icon"
                className="w-5 h-5 mr-2"
              />
              Message Us
            </button>
            <button className="flex items-center text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
              <img
                src="/searchicon.svg"
                alt="Search Icon"
                className="w-5 h-5 mr-2"
              />
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="h-[2px] bg-red-600 w-full"></div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </header>
  );
}
