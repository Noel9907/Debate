import { useState, useEffect, useRef } from "react";
import {
  X,
  MapPin,
  User,
  FileText,
  Heart,
  Save,
  ChevronDown,
} from "lucide-react";
import { useEditProfile } from "../../hooks/useProfile.js";

const AVAILABLE_CATEGORIES = [
  "Politics",
  "Technology",
  "Sports",
  "Entertainment",
  "Science",
  "Health",
  "Education",
  "Environment",
  "Business",
  "Social Issues",
  "Philosophy",
  "Religion",
  "Arts & Culture",
  "History",
  "Economics",
];

const GENDER_OPTIONS = [
  { value: "", label: "Select your gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export default function EditProfileModal({
  isOpen,
  onClose,
  profileData,
  onSave, // Optional callback for parent component
}) {
  const { editProfile, loading } = useEditProfile();

  const [formData, setFormData] = useState({
    gender: profileData.gender || "",
    bio: profileData.bio || "",
    location: profileData.location || "",
    interestedCategories: profileData.interestedCategories || [],
  });

  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        gender: profileData.gender || "",
        bio: profileData.bio || "",
        location: profileData.location || "",
        interestedCategories: profileData.interestedCategories || [],
      });
    }
  }, [isOpen, profileData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsGenderDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoryToggle = (category) => {
    setFormData((prev) => ({
      ...prev,
      interestedCategories: prev.interestedCategories.includes(category)
        ? prev.interestedCategories.filter((c) => c !== category)
        : [...prev.interestedCategories, category],
    }));
  };

  const handleSave = async () => {
    try {
      const result = await editProfile(formData);
      if (result) {
        // Call parent callback if provided
        if (onSave) {
          onSave(result);
        }
        onClose();
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleGenderSelect = (value) => {
    setFormData((prev) => ({ ...prev, gender: value }));
    setIsGenderDropdownOpen(false);
  };

  const getSelectedGenderLabel = () => {
    const selected = GENDER_OPTIONS.find(
      (option) => option.value === formData.gender
    );
    return selected ? selected.label : "Select your gender";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-2xl md:max-w-4xl lg:max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white flex items-center">
            <User className="w-8 h-8 mr-3 text-red-400" />
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Gender */}
          <div className="space-y-3 lg:col-span-1">
            <label className="text-white flex items-center text-lg font-medium">
              <User className="w-5 h-5 mr-2 text-red-400" />
              Gender
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}
                className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg flex items-center justify-between hover:border-gray-500 focus:outline-none focus:border-red-400 transition-colors"
              >
                <span
                  className={formData.gender ? "text-white" : "text-gray-400"}
                >
                  {getSelectedGenderLabel()}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isGenderDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isGenderDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10">
                  {GENDER_OPTIONS.slice(1).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleGenderSelect(option.value)}
                      className="w-full text-left px-4 py-3 text-white hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-3 lg:col-span-2">
            <label className="text-white flex items-center text-lg font-medium">
              <FileText className="w-5 h-5 mr-2 text-red-400" />
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bio: e.target.value }))
              }
              placeholder="Tell us about yourself..."
              className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 px-4 py-3 rounded-lg min-h-[120px] resize-none hover:border-gray-500 focus:outline-none focus:border-red-400 transition-colors"
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-400">
              {formData.bio.length}/500 characters
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3 lg:col-span-1">
            <label className="text-white flex items-center text-lg font-medium">
              <MapPin className="w-5 h-5 mr-2 text-red-400" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="Enter your location"
              className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 px-4 py-3 rounded-lg hover:border-gray-500 focus:outline-none focus:border-red-400 transition-colors"
              maxLength={100}
            />
          </div>

          {/* Interested Categories */}
          <div className="space-y-4 lg:col-span-2">
            <label className="text-white flex items-center text-lg font-medium">
              <Heart className="w-5 h-5 mr-2 text-red-400" />
              Interested Categories
            </label>
            <p className="text-gray-400 text-sm">
              Select topics you're interested in debating about (max 10)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {AVAILABLE_CATEGORIES.map((category) => {
                const isSelected =
                  formData.interestedCategories.includes(category);
                const canSelect =
                  formData.interestedCategories.length < 10 || isSelected;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => canSelect && handleCategoryToggle(category)}
                    disabled={!canSelect}
                    className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? "bg-red-500 text-white border-2 border-red-400"
                        : canSelect
                        ? "bg-gray-700 text-gray-300 border-2 border-gray-600 hover:border-red-400 hover:text-white"
                        : "bg-gray-800 text-gray-500 border-2 border-gray-700 cursor-not-allowed opacity-50"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
            <div className="text-right text-sm text-gray-400">
              {formData.interestedCategories.length}/10 selected
            </div>
          </div>

          {/* Selected Categories Display */}
          {formData.interestedCategories.length > 0 && (
            <div className="space-y-3 lg:col-span-2">
              <label className="text-white text-lg font-medium">
                Selected Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.interestedCategories.map((category) => (
                  <div
                    key={category}
                    className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {category}
                    <button
                      type="button"
                      onClick={() => handleCategoryToggle(category)}
                      className="ml-2 hover:text-red-200 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
