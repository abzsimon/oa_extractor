import { useDispatch } from 'react-redux';
import {
  updateBarrierRemark,
  addBarrierRemark,
  removeBarrierRemark,
} from '../../reducers/article';

const typeOptions = ['A','B','C','D','E','F','G','H','I','J','K'];

export default function ArticleFormBarriers({ remarksOnBarriers }) {
  const dispatch = useDispatch();

  const onChangeField = (index, field, value) => {
    dispatch(updateBarrierRemark({ index, field, value }));
  };

  const onAddRow = () => {
    dispatch(addBarrierRemark({ type: '', citation: '', paragraphe: '' }));
  };

  const onRemoveRow = (index) => {
    dispatch(removeBarrierRemark(index));
  };

  return (
    <div className="mt-4">
      <h4 className="font-medium mb-2">Remarques sur les freins</h4>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border p-2">Type</th>
            <th className="border p-2">Citation</th>
            <th className="border p-2">Paragraphe</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {remarksOnBarriers.map((rem, idx) => (
            <tr key={idx} className="even:bg-gray-50">
              <td className="border p-1">
                <select
                  value={rem.type}
                  onChange={(e) => onChangeField(idx, 'type', e.target.value)}
                  className="w-full p-1 border rounded"
                >
                  <option value="">--</option>
                  {typeOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </td>
              <td className="border p-1">
                <input
                  type="text"
                  value={rem.citation}
                  onChange={(e) => onChangeField(idx, 'citation', e.target.value)}
                  className="w-full p-1 border rounded"
                  placeholder="Citation"
                />
              </td>
              <td className="border p-1">
                <input
                  type="text"
                  value={rem.paragraphe || ''}
                  onChange={(e) => onChangeField(idx, 'paragraphe', e.target.value)}
                  className="w-full p-1 border rounded"
                  placeholder="Paragraphe"
                />
              </td>
              <td className="border p-1 text-center">
                <button
                  type="button"
                  onClick={() => onRemoveRow(idx)}
                  className="text-red-500 hover:underline"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={4} className="p-2 text-center">
              <button
                type="button"
                onClick={onAddRow}
                className="text-blue-500 hover:underline"
              >
                + Ajouter une ligne
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
