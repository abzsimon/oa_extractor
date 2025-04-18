import { useState } from 'react';

export default function TopicTreeExpandable({ topicTree }) {
  if (!topicTree || Object.keys(topicTree).length === 0) {
    return <p className="text-sm italic text-gray-500">Aucun topic tree disponible.</p>;
  }
  return (
    <ul className="text-sm pl-4 space-y-1">
      {Object.entries(topicTree).map(([domainName, domainData]) => (
        <ExpandableItem
          key={domainName}
          name={domainName}
          count={domainData.total}
          childrenData={domainData.fields}
          level="domain"
        />
      ))}
    </ul>
  );
}

function ExpandableItem({ name, count, childrenData, level }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const nextLevelMap = {
    domain: 'field',
    field: 'subfield',
    subfield: 'topic'
  };
  return (
    <li>
      <div
        className="cursor-pointer select-none hover:underline"
        onClick={toggle}
      >
        <span className={`font-medium text-${levelColor(level)}`}>
          ▶ {name}
        </span>{" "}
        <span className="text-gray-500">({count})</span>
      </div>
      {isOpen && (
        <ul className="pl-4 mt-1">
          {level === 'subfield'
            ? Object.entries(childrenData).map(([topicName, count]) => (
                <li key={topicName} className="text-xs text-gray-700">
                  {topicName} — {count}
                </li>
              ))
            : Object.entries(childrenData).map(([childName, childData]) => (
                <ExpandableItem
                  key={childName}
                  name={childName}
                  count={childData.total}
                  childrenData={
                    level === 'domain'
                      ? childData.subfields
                      : level === 'field'
                      ? childData.topics || childData.subfields  // Add childData.topics as fallback
                      : {}
                  }
                  level={nextLevelMap[level]}
                />
              ))}
        </ul>
      )}
    </li>
  );
}

function levelColor(level) {
  switch (level) {
    case 'domain':
      return 'blue-700';
    case 'field':
      return 'blue-500';
    case 'subfield':
      return 'blue-400';
    default:
      return 'gray-600';
  }
}