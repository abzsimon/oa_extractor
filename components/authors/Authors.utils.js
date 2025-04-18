// 🧠 Transforme les topics OpenAlex en structure topic_tree imbriquée
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
  
      categoryCounts[domain].fields[field].subfields[subfield] ||= { total: 0, topics: {} };
      categoryCounts[domain].fields[field].subfields[subfield].total += count;
  
      categoryCounts[domain].fields[field].subfields[subfield].topics[topic] ||= 0;
      categoryCounts[domain].fields[field].subfields[subfield].topics[topic] += count;
    });
  
    return categoryCounts;
  }
  
  // 📊 Calcule les deux plus gros domaines en % du total
  export function getTopTwoDomains(topicTree = {}) {
    const totalAll = Object.values(topicTree).reduce((sum, d) => sum + d.total, 0);
  
    return Object.entries(topicTree)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 2)
      .map(([name, domain]) => ({
        name,
        percentage: +(domain.total / totalAll * 100).toFixed(2)
      }));
  }
  
  // 📈 Calcule les 5 champs les plus représentés
  export function getTopFiveFields(topicTree = {}) {
    const allFields = [];
  
    Object.values(topicTree).forEach(domain => {
      Object.entries(domain.fields).forEach(([fieldName, fieldData]) => {
        allFields.push({
          name: fieldName,
          total: fieldData.total
        });
      });
    });
  
    const total = allFields.reduce((sum, f) => sum + f.total, 0);
  
    return allFields
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(f => ({
        name: f.name,
        percentage: +(f.total / total * 100).toFixed(2)
      }));
  }
  