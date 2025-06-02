import React, { useState } from 'react';
import { createShortUrl } from '../api/shortUrl_api';
const UrlForm: React.FC = () => {
  const [url, setUrl] = useState('');
const [shortUrl, setShortUrl] = useState('');
const [copied, setCopied] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setCopied(false);
  setShortUrl('');

  try {
    const result  = await createShortUrl(url); 
    setShortUrl(result);
  } catch (error) {
    console.error('Error shortening URL:', error);
    alert('Failed to shorten the URL. Please try again.');
  }
};


  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="url" className="font-semibold text-gray-700">
          Enter URL to shorten:
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://www.google.com"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
        >
          Shorten URL
        </button>
      </form>

      {shortUrl && (
        <div className="mt-6 bg-green-100 border border-green-300 rounded p-4">
          <h2 className="text-lg font-semibold text-green-700 mb-2">Your Shortened URL:</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shortUrl}
              className="flex-1 p-2 border border-gray-300 rounded bg-white text-gray-800"
            />
            <button
              onClick={handleCopy}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition duration-200"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlForm;
