'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { uploadGymMedia, validateImageFile, type MediaType } from '@/lib/media-upload';

export default function MediaManagementPage() {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState('');

  const handleFileUpload = async (
    file: File,
    mediaType: MediaType
  ) => {
    if (!session?.user?.gymSlug) {
      setError('Gym information not found');
      return;
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const url = await uploadGymMedia(file, session.user.gymSlug, mediaType);

      const response = await fetch('/api/gym/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaType, url }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(`${mediaType} image uploaded successfully!`);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUrlSubmit = async () => {
    if (!videoUrl) {
      setError('Please enter a video URL');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/gym/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaType: 'video', url: videoUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Update failed');
      }

      setSuccess('Video URL updated successfully!');
      setVideoUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Media Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload and manage your gym's media assets for the landing page.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      <div className="space-y-8">
        {/* Hero Image */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Hero Image
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Main promotional image displayed on the hero section (3:4 aspect ratio recommended)
          </p>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'hero');
              }}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </section>

        {/* About Image */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            About Section Image
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Image for the "About/Story" section (4:3 aspect ratio recommended)
          </p>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'about');
              }}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </section>

        {/* Gallery Images */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Gallery Images
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Upload multiple images to showcase your facilities (square aspect ratio recommended)
          </p>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                files.forEach((file) => handleFileUpload(file, 'gallery'));
              }}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </section>

        {/* Logo */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Logo
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Your gym's logo (displayed in navbar and footer, transparent PNG recommended)
          </p>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'logo');
              }}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </section>

        {/* Video URL */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Featured Video
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Video URL for hero section background (YouTube embed or direct MP4 URL)
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/embed/video-id or https://example.com/video.mp4"
              disabled={uploading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleVideoUrlSubmit}
              disabled={uploading || !videoUrl}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                'Save'
              )}
            </button>
          </div>
        </section>

        {/* Usage Instructions */}
        <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
            Usage Instructions
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• <strong>Image Formats:</strong> JPEG, PNG, WebP, SVG (max 5MB)</li>
            <li>• <strong>Video:</strong> For hero background, use YouTube embed URLs or direct MP4 links</li>
            <li>• <strong>Aspect Ratios:</strong> Hero (3:4), About (4:3), Gallery (1:1), Logo (any)</li>
            <li>• <strong>Optimization:</strong> Images are automatically optimized by Next.js Image component</li>
            <li>• <strong>Gallery:</strong> You can upload multiple images at once for the gallery section</li>
          </ul>
        </section>
      </div>

      {uploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 flex flex-col items-center gap-4">
            <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-indigo-600" />
            <p className="text-gray-900 dark:text-white font-semibold">Uploading...</p>
          </div>
        </div>
      )}
    </div>
  );
}
