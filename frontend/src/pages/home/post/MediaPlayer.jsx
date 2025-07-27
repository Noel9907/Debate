import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

const MediaPlayer = ({
  videoUrl,
  images = [],
  hasVideo = false,
  hasImages = false,
  className = "",
}) => {
  // Video player state
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Image gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  // Control visibility timer
  const controlsTimeoutRef = useRef(null);

  // Format time helper
  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Video event handlers
  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setIsLoading(false);
  };

  const handleProgressClick = (e) => {
    if (!videoRef.current || !progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = Number.parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;

    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSkip = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += seconds;
  };

  const handlePlaybackRateChange = (rate) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  // Image gallery handlers
  const openImageModal = (index) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleImageZoom = (delta) => {
    setImageZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  // Control visibility management
  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showImageModal) {
        switch (e.key) {
          case "Escape":
            closeImageModal();
            break;
          case "ArrowLeft":
            prevImage();
            break;
          case "ArrowRight":
            nextImage();
            break;
          case "+":
          case "=":
            handleImageZoom(0.2);
            break;
          case "-":
            handleImageZoom(-0.2);
            break;
        }
        return;
      }

      if (hasVideo && videoRef.current) {
        switch (e.key) {
          case " ":
            e.preventDefault();
            handlePlayPause();
            break;
          case "ArrowLeft":
            handleSkip(-10);
            break;
          case "ArrowRight":
            handleSkip(10);
            break;
          case "ArrowUp":
            e.preventDefault();
            setVolume((prev) => Math.min(1, prev + 0.1));
            break;
          case "ArrowDown":
            e.preventDefault();
            setVolume((prev) => Math.max(0, prev - 0.1));
            break;
          case "m":
            toggleMute();
            break;
          case "f":
            toggleFullscreen();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showImageModal, hasVideo, isPlaying, volume]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  if (!hasVideo && !hasImages) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Video Player */}
      {hasVideo && videoUrl && (
        <div
          className="relative bg-black rounded-lg overflow-hidden group mb-4"
          onMouseMove={showControlsTemporarily}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          <video
            ref={videoRef}
            className="w-full h-auto aspect-video object-contain"
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onLoadStart={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
            onError={(e) => {
              console.error("Video error:", e);
              setIsLoading(false);
            }}
            preload="metadata"
          />

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}

          {/* Video Controls */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Progress Bar */}
            <div
              ref={progressRef}
              className="w-full h-2 bg-gray-600 rounded-full cursor-pointer mb-4 group"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-red-500 rounded-full relative group-hover:bg-red-400 transition-colors"
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              >
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePlayPause}
                  className="hover:text-red-400 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </button>

                <button
                  onClick={() => handleSkip(-10)}
                  className="hover:text-red-400 transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handleSkip(10)}
                  className="hover:text-red-400 transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMute}
                    className="hover:text-red-400 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <select
                  value={playbackRate}
                  onChange={(e) =>
                    handlePlaybackRateChange(Number.parseFloat(e.target.value))
                  }
                  className="bg-gray-700 text-white text-sm rounded px-2 py-1"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>

                <button
                  onClick={toggleFullscreen}
                  className="hover:text-red-400 transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery */}
      {hasImages && images.length > 0 && (
        <div className={`${hasVideo ? "" : ""}`}>
          {images.length === 1 ? (
            <div
              className="rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => openImageModal(0)}
            >
              <img
                src={images[0] || "/placeholder.svg"}
                alt="Post image"
                className="w-full h-auto aspect-video object-cover group-hover:opacity-90 transition-opacity"
                onError={(e) => {
                  e.target.src = "/placeholder.svg?height=400&width=600";
                }}
              />
            </div>
          ) : images.length === 2 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg overflow-hidden">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img || "/placeholder.svg"}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-48 sm:h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openImageModal(index)}
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=200&width=300";
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg overflow-hidden">
              <img
                src={images[0] || "/placeholder.svg"}
                alt="Post image 1"
                className="w-full h-64 sm:h-80 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openImageModal(0)}
                onError={(e) => {
                  e.target.src = "/placeholder.svg?height=400&width=300";
                }}
              />
              <div className="grid grid-rows-2 gap-2">
                {images.slice(1, 3).map((img, index) => (
                  <img
                    key={index + 1}
                    src={img || "/placeholder.svg"}
                    alt={`Post image ${index + 2}`}
                    className="w-full h-32 sm:h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openImageModal(index + 1)}
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=200&width=300";
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-full max-h-full w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-gray-800 bg-opacity-50 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image controls */}
            <div className="absolute top-4 left-4 flex space-x-2 z-10">
              <button
                onClick={() => handleImageZoom(0.2)}
                className="text-white hover:text-gray-300 bg-gray-800 bg-opacity-50 rounded-full p-2 transition-colors"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleImageZoom(-0.2)}
                className="text-white hover:text-gray-300 bg-gray-800 bg-opacity-50 rounded-full p-2 transition-colors"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setImageZoom(1);
                  setImagePosition({ x: 0, y: 0 });
                }}
                className="text-white hover:text-gray-300 bg-gray-800 bg-opacity-50 rounded-full p-2 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-gray-800 bg-opacity-50 rounded-full p-2 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-gray-800 bg-opacity-50 rounded-full p-2 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Main image */}
            <img
              src={images[currentImageIndex] || "/placeholder.svg"}
              alt={`Post image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${imageZoom}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
              }}
              onError={(e) => {
                e.target.src = "/placeholder.svg?height=600&width=800";
              }}
            />

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Click outside to close */}
          <div className="absolute inset-0 -z-10" onClick={closeImageModal} />
        </div>
      )}

      {/* Custom CSS for slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default MediaPlayer;
