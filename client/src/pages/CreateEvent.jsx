import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App.jsx';

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: 10,
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1_000_000) { // ~1MB max
      alert('Image too large (max 1MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setFormData({ ...formData, image: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login first.');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        navigate('/');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create event');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="text-center py-10">Please login first.</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Create Event</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        <input
          type="text"
          placeholder="Event Title"
          className="w-full p-3 border rounded"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <textarea
          placeholder="Description"
          className="w-full p-3 border rounded"
          rows="3"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="datetime-local"
            className="p-3 border rounded"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Capacity"
            min="1"
            className="p-3 border rounded"
            value={formData.capacity}
            onChange={e => setFormData({ ...formData, capacity: e.target.value })}
            required
          />
        </div>

        <input
          type="text"
          placeholder="Location"
          className="w-full p-3 border rounded"
          value={formData.location}
          onChange={e => setFormData({ ...formData, location: e.target.value })}
        />

        <div>
          <label className="block mb-2">Event Image (optional, max 1MB)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {formData.image && (
            <img
              src={formData.image}
              alt="Preview"
              className="mt-2 w-32 h-32 object-cover rounded"
            />
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded font-medium"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}
