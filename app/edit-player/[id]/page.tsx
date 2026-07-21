"use client";

import { useState, FormEvent, ChangeEvent, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Player {
  _id: string;
  name: string;
  photoUrl: string;
  dateOfJoining: string;
}

export default function EditPlayer() {
  const router = useRouter();
  const params = useParams();
  const playerId = params.id as string;

  const [formData, setFormData] = useState({
    name: "",
    dateOfJoining: "",
  });
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isFlipped, setIsFlipped] = useState(false);
  const lastTapRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const DOUBLE_TAP_DELAY = 300; // ms

  useEffect(() => {
    fetchPlayerData();
  }, [playerId]);

  const fetchPlayerData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/players/${playerId}`);
      const result = await response.json();

      if (result.success) {
        const player: Player = result.data;
        setFormData({
          name: player.name,
          dateOfJoining: new Date(player.dateOfJoining)
            .toISOString()
            .split("T")[0],
        });
        setCurrentPhotoUrl(player.photoUrl);
        setPreviewUrl(player.photoUrl);
      } else {
        setError(result.error || "Failed to fetch player data");
      }
    } catch (err) {
      setError("An error occurred while fetching player data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size should be less than 10MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
      setIsFlipped(false);
    }
  };

  const handleImageDoubleTap = () => {
    const now = Date.now();
    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      setIsFlipped(true);
      lastTapRef.current = null;
    } else {
      lastTapRef.current = now;
    }
  };

  const handleEditImage = () => {
    setIsFlipped(false);
    fileInputRef.current?.click();
  };

  const handleCancelFlip = () => {
    setIsFlipped(false);
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.dateOfJoining) {
      setError("Name and date of joining are required");
      return;
    }

    try {
      setUploading(true);

      let photoUrl = currentPhotoUrl;

      // Only upload new image if user selected one
      if (selectedFile) {
        photoUrl = await uploadToCloudinary(selectedFile);
      }

      const response = await fetch(`/api/players/${playerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          photoUrl,
          dateOfJoining: formData.dateOfJoining,
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push("/");
      } else {
        setError(result.error || "Failed to update player");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600'></div>
          <p className='mt-4 text-gray-600'>Loading player data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-2xl mx-auto'>
        <div className='bg-white rounded-lg shadow-xl p-8'>
          <div className='mb-8'>
            <Link
              href='/'
              className='text-indigo-600 hover:text-indigo-800 font-medium'
            >
              ← Back to Players
            </Link>
            <h1 className='text-3xl font-bold text-gray-900 mt-4'>
              Edit Player
            </h1>
            <p className='text-gray-600 mt-2'>
              Update player details and photo
            </p>
          </div>

          {error && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Player Name *
              </label>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                placeholder='Enter player name'
                required
              />
            </div>

            <div>
              <label
                htmlFor='dateOfJoining'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Date of Joining *
              </label>
              <input
                type='date'
                id='dateOfJoining'
                name='dateOfJoining'
                value={formData.dateOfJoining}
                onChange={handleInputChange}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                required
              />
            </div>

            <div>
              <label
                htmlFor='photo'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Player Photo
              </label>
              <input
                ref={fileInputRef}
                type='file'
                id='photo'
                accept='image/*'
                onChange={handleFileChange}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              />
              <p className='text-sm text-gray-500 mt-1'>
                Leave empty to keep current photo
              </p>
              {previewUrl && (
                <div
                  className='mt-4 relative h-64 w-full'
                  style={{ perspective: "1000px" }}
                >
                  <div
                    className='relative w-full h-full transition-transform duration-700'
                    style={{
                      transformStyle: "preserve-3d",
                      transform: isFlipped
                        ? "rotateY(180deg)"
                        : "rotateY(0deg)",
                    }}
                  >
                    {/* Front of card - Player Image */}
                    <div
                      className='absolute w-full h-full rounded-lg overflow-hidden cursor-pointer shadow-lg'
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                      }}
                      onClick={handleImageDoubleTap}
                      onTouchEnd={handleImageDoubleTap}
                      role='button'
                      tabIndex={0}
                      aria-label='Player photo preview, double tap to flip and edit'
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setIsFlipped(true);
                        }
                      }}
                    >
                      <Image
                        src={previewUrl}
                        alt='Preview'
                        fill
                        className='object-cover'
                      />
                      <div className='absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium'>
                        Double tap to change
                      </div>
                    </div>

                    {/* Back of card - Edit Controls */}
                    <div
                      className='absolute w-full h-full rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg flex flex-col items-center justify-center gap-4 p-6'
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <div className='text-white text-center'>
                        <h3 className='text-xl font-bold mb-2'>
                          Change Player Photo
                        </h3>
                        <p className='text-sm text-indigo-100'>
                          Choose an action below
                        </p>
                      </div>
                      <button
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditImage();
                        }}
                        className='bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 shadow-lg transition-all w-full max-w-xs'
                        aria-label='Change image'
                      >
                        📷 Change Image
                      </button>
                      <button
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelFlip();
                        }}
                        className='bg-white/20 text-white px-6 py-2 rounded-lg font-medium hover:bg-white/30 transition-all w-full max-w-xs'
                        aria-label='Cancel and flip back'
                      >
                        ← Back
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className='flex gap-4'>
              <button
                type='submit'
                disabled={uploading}
                className='flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
              >
                {uploading ? "Updating Player..." : "Update Player"}
              </button>
              <Link
                href='/'
                className='flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center'
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
