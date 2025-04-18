import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import TopicTreeExpandable from './TopicTreeExpandable';
import { setAuthor, clearAuthor, updateAuthorField } from '../../reducers/author'

export default function AuthorViewer() {
    const author = useSelector((state) => state.author);
    const dispatch = useDispatch();
  
    if (!author || !author.oa_id) {
      return <p className="text-gray-500 italic text-center">Aucun auteur sélectionné.</p>;
    }
  
    const handleInput = (field) => (e) => {
      dispatch(updateAuthorField({ field, value: e.target.value }));
    };
  
    return (
      <div className="space-y-4 text-sm text-gray-800">
  
        {/* 🧠 Grid en 3 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  
          {/* Colonne 1 : Infos générales */}
          <div className="space-y-1">
            <p><strong>Nom :</strong> {author.display_name}</p>
            <p><strong>OA ID :</strong> {author.oa_id}</p>
            <p><strong>ORCID :</strong> {author.orcid || '—'}</p>
            <p><strong>Citations :</strong> {author.cited_by_count}</p>
            <p><strong>Publications :</strong> {author.works_count}</p>
          </div>
  
          {/* Colonne 2 : Top topics & domains */}
          <div className="space-y-3">
            <div>
              <p className="font-semibold">Top 5 Topics</p>
              <ul className="list-disc list-inside">
                {author.top_five_topics.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
  
            <div>
              <p className="font-semibold">Top 2 Domains</p>
              <ul className="list-disc list-inside">
                {author.top_two_domains.map((d, i) => (
                  <li key={i}>{d.name} ({d.percentage}%)</li>
                ))}
              </ul>
            </div>
          </div>
  
          {/* Colonne 3 : Topic Tree */}
          <div>
            <p className="font-semibold mb-1">Topic Tree</p>
            <div className="max-h-64 overflow-auto border border-gray-200 rounded p-2 bg-gray-50">
              <TopicTreeExpandable topicTree={author.topic_tree} />
            </div>
          </div>
        </div>
  
        {/* ✏️ Champs manuels */}
        <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
          <h3 className="font-semibold text-gray-700 mb-2">Champs à compléter</h3>
          <div className="flex flex-col gap-2">
            <label>
              Genre :
              <select
                value={author.gender}
                onChange={handleInput('gender')}
                className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="">--</option>
                <option value="female">Femme</option>
                <option value="male">Homme</option>
                <option value="nonbinary">Non-binaire</option>
              </select>
            </label>
  
            <label>
              Statut :
              <select
                value={author.status}
                onChange={handleInput('status')}
                className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="">--</option>
                {['A','B','C','D','E','F','G','H'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
  
            <label>
              Annotation :
              <textarea
                value={author.annotation}
                onChange={handleInput('annotation')}
                rows={2}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder="Ajouter un commentaire ou une note"
              />
            </label>
          </div>
        </div>
  
        {/* 📚 Types de documents */}
        {author.doctypes.length > 0 && (
          <div>
            <h4 className="font-semibold">Types de documents</h4>
            <ul className="flex flex-wrap gap-2 text-xs mt-1">
              {author.doctypes.map((d, i) => (
                <li key={i} className="bg-gray-100 px-2 py-1 rounded">
                  {d.name}: {d.quantity}
                </li>
              ))}
            </ul>
          </div>
        )}
  
        {/* 🔢 Works IDs */}
        <div>
          <h4 className="font-semibold">Publications ({author.overall_works.length})</h4>
          <div className="max-h-24 overflow-auto text-xs bg-gray-50 p-2 border border-gray-200 rounded">
            {author.overall_works.join(', ')}
          </div>
        </div>
      </div>
    );
  }