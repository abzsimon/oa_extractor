// Transforms flat data.topics (from open alex) into topic tree type 1 for reducer and TopicTreeExpandable.jsx component which helps display the cat taxonomy
export function buildTopicTree(topics = []) {
  const categoryCounts = {};

  topics.forEach((doc) => {
    const domain = doc.domain.display_name;
    const field = doc.field.display_name;
    const subfield = doc.subfield.display_name;
    const topic = doc.display_name;
    const count = doc.count;

    categoryCounts[domain] ||= { total: 0, fields: {} };
    categoryCounts[domain].total += count;

    categoryCounts[domain].fields[field] ||= { total: 0, subfields: {} };
    categoryCounts[domain].fields[field].total += count;

    categoryCounts[domain].fields[field].subfields[subfield] ||= {
      total: 0,
      topics: {},
    };
    categoryCounts[domain].fields[field].subfields[subfield].total += count;

    categoryCounts[domain].fields[field].subfields[subfield].topics[
      topic
    ] ||= 0;
    categoryCounts[domain].fields[field].subfields[subfield].topics[topic] +=
      count;
  });

  return categoryCounts;
}

// transforms topic tree type 1 (reducer) into topic tree type 2 for mongo db, as type 1 is not storable within current author model
export function convertTopicTreeForMongoose(topicTree) {
  return Object.entries(topicTree).map(([domainName, domainData]) => ({
    name: domainName,
    total: domainData.total,
    fields: Object.entries(domainData.fields).map(([fieldName, fieldData]) => ({
      name: fieldName,
      total: fieldData.total,
      subfields: Object.entries(fieldData.subfields).map(
        ([subfieldName, subfieldData]) => ({
          name: subfieldName,
          total: subfieldData.total,
          topics: Object.entries(subfieldData.topics).map(
            ([topicName, count]) => ({
              name: topicName,
              count: count,
            })
          ),
        })
      ),
    })),
  }));
}

// transforms topic tree type 2 into topic tree type 1 for reducer. If author already in database, their data will be retrieved from database rather than from open alex, so db topic tree (type 2) needs to be converted back into reducer topic tree (type 1)
export function convertTopicTreeForReducer(topicTree = []) {
  const result = {};

  topicTree.forEach((domain) => {
    const { name: domainName, total: domainTotal, fields } = domain;
    result[domainName] = {
      total: domainTotal,
      fields: {},
    };

    fields.forEach((field) => {
      const { name: fieldName, total: fieldTotal, subfields } = field;
      result[domainName].fields[fieldName] = {
        total: fieldTotal,
        subfields: {},
      };

      subfields.forEach((subfield) => {
        const { name: subfieldName, total: subfieldTotal, topics } = subfield;
        result[domainName].fields[fieldName].subfields[subfieldName] = {
          total: subfieldTotal,
          topics: {},
        };

        topics.forEach((topic) => {
          const { name: topicName, count } = topic;
          result[domainName].fields[fieldName].subfields[subfieldName].topics[
            topicName
          ] = count;
        });
      });
    });
  });

  return result;
}

// 📊 Calcule les deux plus gros domaines en % du total
export function getTopTwoDomains(topicTree = {}) {
  const totalAll = Object.values(topicTree).reduce(
    (sum, d) => sum + d.total,
    0
  );

  return Object.entries(topicTree)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 2)
    .map(([name, domain]) => ({
      name,
      percentage: +((domain.total / totalAll) * 100).toFixed(2),
    }));
}

// 📈 Calcule les 5 champs les plus représentés
export function getTopFiveFields(topicTree = {}) {
  const allFields = [];

  Object.values(topicTree).forEach((domain) => {
    Object.entries(domain.fields).forEach(([fieldName, fieldData]) => {
      allFields.push({
        name: fieldName,
        total: fieldData.total,
      });
    });
  });

  const total = allFields.reduce((sum, f) => sum + f.total, 0);

  return allFields
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((f) => ({
      name: f.name,
      percentage: +((f.total / total) * 100).toFixed(2),
    }));
}

export function normalizeAuthor(author) {
  const topicTree =
    author.topic_tree || (author.topics ? buildTopicTree(author.topics) : null);

  const top_two_domains = topicTree ? getTopTwoDomains(topicTree) : [];
  const top_five_topics =
    author.top_five_topics || (author.topics || []).slice(0, 5);

  return {
    name: author.name || author.display_name || "Unknown Author",
    oaId:
      author.oaId || (author.oa_id && `https://openalex.org/${author.oa_id}`),
    orcId:
      author.orcId ||
      (author.orcid_id && `https://orcid.org/${author.orcid_id}`),
    institutions: author.institutions || [],
    countries: author.countries || [],
    top_two_domains,
    top_five_topics,
    gender: author.gender || "",
    isInDb: author.isInDb || false,
  };
}
