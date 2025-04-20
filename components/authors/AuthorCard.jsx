import React, { useState } from "react";
import { normalizeAuthor } from "./Authors.utils";
import DbStatusPill from "./DbStatusPill";

const AuthorCard = ({ author }) => {
  const {
    name,
    oaId,
    orcId,
    institutions,
    countries,
    top_two_domains,
    top_five_topics,
    gender,
    works_count,
  } = normalizeAuthor(author);

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 text-sm">
      {/* 💾 DB status pill */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <DbStatusPill oaId={oaId} />
      </div>

      {/* Name & IDs */}
      <h3 className="text-base font-semibold text-gray-800">{name}</h3>

      {works_count > 0 && (
        <div className="mt-1 text-[13px] text-gray-600">
          📚 {works_count} publication{works_count > 1 ? "s" : ""}
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        {oaId && (
          <a
            href={oaId}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded"
          >
            OpenAlex
          </a>
        )}
        {orcId && (
          <a
            href={`https://orcid.org/${orcId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded"
          >
            ORCID
          </a>
        )}
      </div>

      {/* Institutions */}
      {institutions.length > 0 && (
        <div className="mt-3 flex items-start">
          <span className="w-20 font-medium text-gray-500">Institutions:</span>
          <div className="flex-1 flex flex-wrap gap-1">
            {institutions.slice(0, 2).map((inst, i) => (
              <span
                key={i}
                className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs border border-gray-200"
              >
                {inst}
              </span>
            ))}
            {institutions.length > 2 && (
              <button
                onClick={() => setShowModal(true)}
                className="text-xs text-blue-600 underline hover:text-blue-800"
              >
                + {institutions.length - 2} more
              </button>
            )}
          </div>
        </div>
      )}

      {/* Countries */}
      {countries.length > 0 && (
        <div className="mt-2 flex items-start">
          <span className="w-20 font-medium text-gray-500">Countries:</span>
          <span className="text-gray-700">{countries.join(", ")}</span>
        </div>
      )}

      {/* Gender */}
      {gender && (
        <div className="mt-2 flex items-start">
          <span className="w-20 font-medium text-gray-500">Gender:</span>
          <span className="text-gray-700">{gender}</span>
        </div>
      )}

      {/* Top Domains */}
      {top_two_domains.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5">
            Top Domains
          </h4>
          <div className="flex flex-wrap gap-1">
            {top_two_domains.map((domain, idx) => (
              <div
                key={idx}
                className="inline-flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
              >
                {domain.name}
                <span className="ml-1 bg-blue-100 text-blue-800 px-1.5 rounded-full text-xs">
                  {domain.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Topics */}
      {top_five_topics.length > 0 && (
        <div className="mt-3">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5">
            Top Topics
          </h4>
          <div className="flex flex-wrap gap-1">
            {top_five_topics.map((topic, idx) => {
              const topicName = topic.display_name || topic;
              return (
                <span
                  key={idx}
                  className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs"
                >
                  {topicName}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal for full institutions list */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              All Institutions
            </h2>
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-1 text-sm text-gray-700">
              {institutions.map((inst, i) => (
                <li key={i} className="border-b border-gray-200 pb-1">
                  {inst}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorCard;
