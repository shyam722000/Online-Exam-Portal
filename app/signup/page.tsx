"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import loginIllustration from "@/public/login-1.png";
import loginBG from "@/public/login-bg.png";
import logo from "@/public/logo.png";
import { BASE_URL } from "../lib/api"; // we only need BASE_URL here

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mobile passed from login: /signup?mobile=+911234567891
  const mobileFromQuery = searchParams.get("mobile") || "";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [qualification, setQualification] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);

  const handleProfileClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileFile(file);

    const url = URL.createObjectURL(file);
    setProfilePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!qualification.trim()) {
      setError("Please enter your qualification.");
      return;
    }
    if (!profileFile) {
      setError("Please upload your profile image.");
      return;
    }
    if (!mobileFromQuery) {
      setError("Mobile number is missing. Please login again.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Build FormData for /auth/create-profile
      const formData = new FormData();
      formData.append("mobile", mobileFromQuery);
      formData.append("name", fullName.trim());
      formData.append("email", email.trim());
      formData.append("qualification", qualification.trim());
      formData.append("profile_image", profileFile);

      const response = await fetch(`${BASE_URL}/auth/create-profile`, {
        method: "POST",
        body: formData,
      });

      const res = await response.json();

      if (!response.ok || !res?.success) {
        setError(res?.message || "Registration failed. Please try again.");
        return;
      }

      // Save tokens from API
      if (res.access_token) {
        localStorage.setItem("access_token", res.access_token);
      }
      if (res.refresh_token) {
        localStorage.setItem("refresh_token", res.refresh_token);
      }

      // redirect to home page
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Background */}
      <Image
        src={loginBG}
        alt="Background"
        fill
        className="object-cover"
        priority
      />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-5xl">
        <div className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-3">
          <div className="grid md:grid-cols-[1.15fr_1fr] gap-3">
            {/* LEFT — Illustration Section (same as login) */}
            <div className="rounded-3xl md:rounded-l-3xl md:rounded-r-none px-10 py-10 flex flex-col">
              {/* Logo - centered */}
              <div className="flex justify-center items-center mb-6">
                <div className="relative w-52 h-16">
                  <Image
                    src={logo}
                    alt="NexLearn Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Illustration */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-72 h-72 md:w-[20rem] md:h-[20rem]">
                  <Image
                    src={loginIllustration}
                    alt="Learning Illustration"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT — Signup Card (scrollable, scrollbar hidden) */}
            <div
              className="
                bg-white rounded-3xl border border-[#D1D5DB] shadow-sm 
                max-w-md w-full max-h-[520px] overflow-y-auto 
                [scrollbar-width:none] [-ms-overflow-style:none] 
                [&::-webkit-scrollbar]:hidden
              "
            >
              <div className="p-8 pb-10 flex flex-col h-full">
                <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                  <div className="flex flex-col flex-1">
                    <h2 className="text-[22px] font-semibold text-[#1C3141] mb-4">
                      Add Your Details
                    </h2>

                    {/* Profile picture placeholder - centered square */}
                    <div className="mb-6 flex justify-center">
                      <div
                        onClick={handleProfileClick}
                        className="w-32 h-32 border border-dashed border-[#CBD5E1] rounded-2xl 
                                   flex flex-col items-center justify-center cursor-pointer 
                                   hover:bg-slate-50 transition overflow-hidden"
                      >
                        {profilePreview ? (
                          <img
                            src={profilePreview}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center mb-1">
                              <span className="text-lg text-slate-500">+</span>
                            </div>
                            <p className="text-[11px] text-slate-500 text-center px-2">
                              Add Your Profile picture
                            </p>
                          </>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleProfileChange}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Name */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-[#4B5563] mb-1">
                        Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your Full Name"
                        className="w-full rounded-xl border border-[#CBD5E1] px-3 py-2.5 text-sm 
                                   outline-none placeholder:text-slate-400 bg-white text-[#111827]"
                      />
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-[#4B5563] mb-1">
                        Email<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your Email Address"
                        className="w-full rounded-xl border border-[#CBD5E1] px-3 py-2.5 text-sm 
                                   outline-none placeholder:text-slate-400 bg-white text-[#111827]"
                      />
                    </div>

                    {/* Qualification */}
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-[#4B5563] mb-1">
                        Your qualification<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        placeholder="Enter your qualification"
                        className="w-full rounded-xl border border-[#CBD5E1] px-3 py-2.5 text-sm 
                                   outline-none placeholder:text-slate-400 bg-white text-[#111827]"
                      />
                    </div>

                    {/* Mobile info */}
                    {mobileFromQuery && (
                      <p className="mt-2 text-[11px] text-slate-500">
                        Mobile:{" "}
                        <span className="font-medium">{mobileFromQuery}</span>
                      </p>
                    )}

                    {error && (
                      <p className="mt-2 text-xs text-red-500">{error}</p>
                    )}
                  </div>

                  {/* Submit Button – with bottom space */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-6 mb-1 w-full py-3 rounded-xl bg-[#0A0A0A] text-white text-sm font-medium hover:bg-black transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Get Started"}
                  </button>
                </form>
              </div>
            </div>
            {/* END RIGHT */}
          </div>
        </div>
      </div>
    </div>
  );
}
