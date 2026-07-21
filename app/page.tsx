"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Player {
  _id: string;
  name: string;
  photoUrl: string;
  dateOfJoining: string;
}

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditButton, setShowEditButton] = useState<string | null>(null);
  const lastTapRef = useRef<{ playerId: string; time: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/players");
      const result = await response.json();

      if (result.success) {
        setPlayers(result.data);
      } else {
        setError(result.error || "Failed to fetch players");
      }
    } catch (err) {
      setError("An error occurred while fetching players");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageDoubleTap = (playerId: string) => {
    const now = Date.now();
    const lastTap = lastTapRef.current;

    if (lastTap && lastTap.playerId === playerId && now - lastTap.time < 300) {
      // Double tap detected
      setShowEditButton(playerId);
      lastTapRef.current = null;
    } else {
      // First tap or different card
      lastTapRef.current = { playerId, time: now };
    }
  };

  const handleEditPlayer = (playerId: string) => {
    router.push(`/edit-player/${playerId}`);
  };

  const handleClickOutside = () => {
    setShowEditButton(null);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            Shoulder Injury Tracker
          </h1>
          <p className='text-lg text-gray-600 mb-8'>
            Track players with shoulder injuries
          </p>
          <Link
            href='/add-player'
            className='inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg'
          >
            Add New Player
          </Link>
        </div>

        {loading && (
          <div className='text-center py-12'>
            <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600'></div>
            <p className='mt-4 text-gray-600'>Loading players...</p>
          </div>
        )}

        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8'>
            {error}
          </div>
        )}

        {!loading && !error && players.length === 0 && (
          <div className='text-center py-12 bg-white rounded-lg shadow'>
            <p className='text-gray-500 text-lg'>
              No players found. Add your first player to get started!
            </p>
          </div>
        )}

        {!loading && players.length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {players.map((player) => (
              <div
                key={player._id}
                className='bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow relative'
                onClick={handleClickOutside}
              >
                <div
                  className='relative h-64 w-full cursor-pointer'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageDoubleTap(player._id);
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    handleImageDoubleTap(player._id);
                  }}
                >
                  <Image
                    src={player.photoUrl}
                    alt={player.name}
                    fill
                    className='object-cover'
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  />
                  {showEditButton === player._id && (
                    <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-4 z-10'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPlayer(player._id);
                        }}
                        className='bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors shadow-lg'
                        aria-label='Edit player'
                      >
                        Edit Player
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEditButton(null);
                        }}
                        className='bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors shadow-lg'
                        aria-label='Cancel edit'
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                <div className='p-6'>
                  <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                    {player.name}
                  </h3>
                  <p className='text-gray-600'>
                    <span className='font-medium'>Date of Joining:</span>{" "}
                    {new Date(player.dateOfJoining).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
