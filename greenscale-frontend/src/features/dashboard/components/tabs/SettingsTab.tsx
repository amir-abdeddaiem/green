import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Lock, AlertCircle, CheckCircle2, Upload, User } from "lucide-react";

export function SettingsTab() {
  const businessName = localStorage.getItem("business_name") || "Business";
  const email = localStorage.getItem("email") || "user@example.com";
  const businessId = localStorage.getItem("user_id") || "1";

  const [activeTab, setActiveTab] = useState<"profile" | "security" | "danger">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string>(
    localStorage.getItem("profile_picture") || ""
  );
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadMessage("❌ Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage("❌ Image size must be less than 5MB");
      return;
    }

    setIsUploadingPicture(true);
    setUploadMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("business_id", businessId);

      const response = await fetch("http://127.0.0.1:8001/upload-profile-picture", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfilePicture(data.image_url);
        localStorage.setItem("profile_picture", data.image_url);
        setUploadMessage("✅ Profile picture updated successfully!");
        setTimeout(() => setUploadMessage(""), 3000);
      } else {
        setUploadMessage("❌ Failed to upload profile picture");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setUploadMessage("❌ Error uploading profile picture");
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleSaveProfile = () => {
    alert("✅ Profile updated successfully!");
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    alert("🔐 Password change feature coming soon!");
  };

  const handleDeleteAccount = () => {
    alert("⚠️ Account deletion is permanent. This feature will be enabled after confirmation.");
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8 lg:p-12 space-y-8 md:space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900">Settings & Control</h1>
        <p className="text-gray-600 text-sm md:text-base">Manage your business profile and account settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-300">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${
            activeTab === "profile"
              ? "border-black text-gray-900"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${
            activeTab === "security"
              ? "border-black text-gray-900"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Security
        </button>
        <button
          onClick={() => setActiveTab("danger")}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${
            activeTab === "danger"
              ? "border-red-600 text-red-700"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Danger Zone
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Profile Picture Card */}
          <Card className="p-6 rounded-lg shadow-lg bg-white border border-gray-300">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Picture</h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Current Picture */}
              <div className="flex-shrink-0">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-32 h-32 rounded-lg object-cover border-4 border-gray-100 shadow"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-black flex items-center justify-center border-4 border-gray-100 shadow">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>

              {/* Upload Section */}
              <div className="flex-1">
                <label className="block">
                  <div className="flex items-center gap-2 px-6 py-3 bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    <Upload className="w-5 h-5 text-gray-700" />
                    <span className="font-semibold text-gray-700">
                      {isUploadingPicture ? "Uploading..." : "Choose Image"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    disabled={isUploadingPicture}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-600 mt-2">JPG, PNG or WebP (Max 5MB)</p>
                {uploadMessage && (
                  <p className={`text-sm font-semibold mt-2 ${uploadMessage.includes("✅") ? "text-gray-900" : "text-red-600"}`}>
                    {uploadMessage}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Profile Information Card */}
          <Card className="p-6 rounded-lg shadow-lg bg-white border border-gray-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {businessName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{businessName}</h3>
                <p className="text-sm text-gray-600">ID: {businessId}</p>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
                  <input
                    type="text"
                    defaultValue={businessName}
                    className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={email}
                    className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 px-4 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="pb-3 border-b border-gray-300">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Business Name</p>
                  <p className="text-gray-900 font-semibold">{businessName}</p>
                </div>
                <div className="pb-3 border-b border-gray-300">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Email</p>
                  <p className="text-gray-900 font-semibold">{email}</p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-900 font-bold rounded-lg hover:bg-gray-200 transition-colors border border-gray-400"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </Card>

          {/* Profile Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 rounded-lg bg-white border border-gray-300">
              <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Account Status</p>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-gray-700" />
                <span className="font-bold text-gray-900">Active</span>
              </div>
            </Card>
            <Card className="p-4 rounded-lg bg-white border border-gray-300">
              <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Member Since</p>
              <p className="font-bold text-gray-900">January 2025</p>
            </Card>
            <Card className="p-4 rounded-lg bg-white border border-gray-300">
              <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Plan</p>
              <p className="font-bold text-gray-900">Professional</p>
            </Card>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <Card className="p-6 rounded-lg shadow-lg bg-white border border-gray-300">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-gray-700" />
              <h3 className="text-lg font-bold text-gray-900">Password & Security</h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-700 mb-3">Update your password to keep your account secure.</p>
                <button
                  onClick={handleChangePassword}
                  className="px-4 py-2.5 bg-gray-100 text-gray-900 font-bold rounded-lg hover:bg-gray-200 transition-colors border border-gray-400"
                >
                  Change Password
                </button>
              </div>

              <div className="pt-4 border-t border-gray-300">
                <h4 className="font-bold text-gray-900 mb-3">Active Sessions</h4>
                <Card className="p-3 rounded-lg bg-gray-50 border border-gray-400">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Current Browser</p>
                      <p className="text-xs text-gray-600">Chrome on Windows</p>
                    </div>
                    <span className="text-xs font-bold text-gray-700">Active Now</span>
                  </div>
                </Card>
              </div>

              <div className="pt-4 border-t border-gray-300">
                <p className="text-sm text-gray-700 mb-3">Two-Factor Authentication (coming soon)</p>
                <button
                  disabled
                  className="px-4 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-lg cursor-not-allowed opacity-50 border border-gray-400"
                >
                  Enable 2FA (Phase 6)
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Danger Zone Tab */}
      {activeTab === "danger" && (
        <div className="space-y-6">
          <Card className="p-6 rounded-lg shadow-lg bg-gray-50 border-2 border-gray-400">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-gray-700 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Danger Zone</h3>
                <p className="text-sm text-gray-700">These actions are permanent and cannot be undone.</p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              {/* Export Data */}
              <div className="p-4 bg-white rounded-lg border border-gray-400">
                <h4 className="font-bold text-gray-900 mb-2">Download Your Data</h4>
                <p className="text-sm text-gray-600 mb-3">Get a copy of all your emissions data in a portable format.</p>
                <button className="px-4 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors">
                  Download Data
                </button>
              </div>

              {/* Delete Account */}
              <div className="p-4 bg-white rounded-lg border border-gray-400">
                <h4 className="font-bold text-gray-900 mb-2">Delete Account</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Permanently delete your account and all associated data. This action cannot be reversed.
                </p>
                {showDeleteConfirm ? (
                  <div className="space-y-3 p-3 bg-gray-100 rounded-lg border border-gray-400">
                    <p className="text-sm font-semibold text-gray-900">Are you absolutely sure?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteAccount}
                        className="flex-1 px-3 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Yes, Delete Everything
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 px-3 py-2 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Delete Account
                  </button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}