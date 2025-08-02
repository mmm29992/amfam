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
            Engle Agency
          </button>
          <span className="text-blue-800 font-extrabold">with</span>
          <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
            Mauricia Engle
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button
            id="signin-trigger"
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
          {/* Left: AmFam Logo */}
          <div className="flex items-center">
            <img
              src="/amfam-logo.svg"
              alt="American Family Insurance Logo"
              className="h-[80px] w-auto mr-4"
            />
          </div>
          <h3 className="text-gray-900 text-xl"> Hablamos Español!!</h3>

          {/* Right: Engle Agency Logo */}
          <div className="flex items-center">
            <img
              src="/englelogo.png"
              alt="Engle Agency Logo"
              className="h-[100px] w-auto ml-4"
            />
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
