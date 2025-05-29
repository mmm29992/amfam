import React from "react";

type LoginFormProps = {
  identifier: string;
  password: string;
  setIdentifier: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  handleLogin: (e: React.FormEvent) => void;
  error: string;
};

const LoginForm: React.FC<LoginFormProps> = ({
  identifier,
  password,
  setIdentifier,
  setPassword,
  handleLogin,
  error,
}) => {
  return (
    <form className="flex flex-col space-y-4" onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="Username or Email"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        className="px-4 py-2 border rounded-md border-blue-800 placeholder-gray-400 text-gray-600 focus:outline-none focus:border-blue-500"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="px-4 py-2 border rounded-md border-blue-800 placeholder-gray-400 text-gray-600 focus:outline-none focus:border-blue-500"
        required
      />

      {error && <p className="text-red-500">{error}</p>}

      <div className="flex justify-between items-center mt-4">
        <label className="flex items-center text-gray-400">
          <input type="checkbox" className="mr-2" />
          Remember Me
        </label>
        <div className="text-sm text-blue-500">
          <a href="#">Forgot User ID</a> | <a href="#">Forgot Password</a>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded-md"
        >
          Log In
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
