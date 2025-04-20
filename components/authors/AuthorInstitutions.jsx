import React from "react";

const AuthorInstitutions = ({ institutions, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Institutions</h2>
        <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {institutions.map((inst, i) => (
            <li
              key={i}
              className="text-sm text-gray-700 border-b border-gray-200 pb-1"
            >
              {inst}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthorInstitutions;
