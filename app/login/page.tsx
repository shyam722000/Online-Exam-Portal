"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import loginIllustration from "@/public/login-1.png";
import loginBG from "@/public/login-bg.png";
import logo from "@/public/logo.png";
import logodark from "@/public/logodark.png";

import { apiPostForm } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneError, setPhoneError] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const fullMobile = `${countryCode}${phoneNumber}`;

  const formattedPhone = phoneNumber
    ? `${countryCode} ${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4)}`
    : countryCode;

  /* ------------ local helper: SEND OTP ------------ */
  const sendOtp = async () => {
    setIsSendingOtp(true);
    setPhoneError("");

    try {
      const res = await apiPostForm("/auth/send-otp", {
        mobile: fullMobile,
      });

      if (!res?.success) {
        setPhoneError(res?.message || "Failed to send OTP. Please try again.");
        return false;
      }

      return true;
    } catch (err) {
      console.error(err);
      setPhoneError("Something went wrong. Please try again.");
      return false;
    } finally {
      setIsSendingOtp(false);
    }
  };

  /* ------------ local helper: VERIFY OTP ------------ */
  const verifyOtp = async () => {
    setIsVerifyingOtp(true);
    setOtpError("");

    try {
      const res = await apiPostForm("/auth/verify-otp", {
        mobile: fullMobile,
        otp,
      });

      if (!res?.success) {
        setOtpError(res?.message || "Invalid code. Please try again.");
        return;
      }

      if (res.login) {
        if (res.access_token) {
          localStorage.setItem("access_token", res.access_token);
        }
        if (res.refresh_token) {
          localStorage.setItem("refresh_token", res.refresh_token);
        }
        router.push("/");
      } else {
        router.push(`/signup?mobile=${encodeURIComponent(fullMobile)}`);
      }
    } catch (err) {
      console.error(err);
      setOtpError("Something went wrong. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  /* ------------ handlers ------------ */
  const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = phoneNumber.trim();
    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(value)) {
      setPhoneError("Please enter a valid 10 digit mobile number.");
      return;
    }

    const ok = await sendOtp();
    if (ok) {
      setStep("otp");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (otp.trim().length !== 6) {
      setOtpError("Please enter the 6 digit code.");
      return;
    }

    await verifyOtp();
  };

  const handleResendOtp = async () => {
    if (!phoneNumber) return;
    await sendOtp();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6">
      {/* Background */}
      <Image
        src={loginBG}
        alt="Background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-slate-950/75" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-2 sm:p-3">
          <div className="grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-3 items-center">
            {/* LEFT — Illustration Section (hidden on mobile) */}
            <div className="hidden md:flex rounded-2xl md:rounded-l-2xl md:rounded-r-none px-5 lg:px-6 py-5 lg:py-6 flex-col">
              {/* Logo */}
              <div className="flex justify-center items-center mb-4">
                <div className="relative w-36 h-12 lg:w-44 lg:h-14">
                  <Image
                    src={logo}
                    alt="NexLearn Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Illustration */}
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40 lg:w-48 lg:h-48">
                  <Image
                    src={loginIllustration}
                    alt="Learning Illustration"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT — White Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 lg:p-6 flex flex-col border border-[#D1D5DB] shadow-sm max-w-sm w-full mx-auto">
              {/* Mobile Logo (only on small screens) */}
              <div className="md:hidden flex justify-center items-center mb-4">
                <div className="relative w-28 h-9">
                  <Image
                    src={logodark}
                    alt="NexLearn Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* STEP 1: PHONE FORM */}
              {step === "phone" && (
                <form
                  onSubmit={handlePhoneSubmit}
                  className="flex flex-col flex-1"
                >
                  <div className="flex flex-col flex-1">
                    <h2 className="text-xl sm:text-2xl font-semibold text-[#1C3141] mb-2">
                      Enter your phone number
                    </h2>

                    <p className="text-sm sm:text-base text-[#1C3141] mb-4 sm:mb-4">
                      We use your mobile number to identify your account
                    </p>

                    {/* Phone Input */}
                    <div className="w-full mb-2">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-[#4B5563] mb-1"
                      >
                        Phone number
                      </label>

                      <div className="flex items-center gap-2 border border-[#CBD5E1] rounded-xl px-2 py-2.5 sm:py-3 bg-white">
                        {/* Country code select */}
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="bg-transparent border-none outline-none cursor-pointer text-xs sm:text-sm font-medium text-[#374151]"
                        >
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+971">🇦🇪 +971</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+61">🇦🇺 +61</option>
                        </select>

                        <input
                          id="phone"
                          type="tel"
                          maxLength={10}
                          value={phoneNumber}
                          onChange={(e) =>
                            setPhoneNumber(e.target.value.replace(/\D/g, ""))
                          }
                          placeholder="1234 567891"
                          className="ml-2 w-full bg-transparent outline-none text-sm sm:text-base text-[#111827] placeholder:text-[#9CA3AF]"
                        />
                      </div>
                      {phoneError && (
                        <p className="mt-1 text-xs text-red-500">
                          {phoneError}
                        </p>
                      )}
                    </div>

                    {/* Terms */}
                    <p className="mt-3 text-xs sm:text-sm text-[#6B7280]">
                      By tapping Get started, you agree to the{" "}
                      <a
                        href="#"
                        className="text-[#0369A1] font-medium hover:underline"
                      >
                        Terms & Conditions
                      </a>
                      .
                    </p>
                  </div>

                  {/* Bottom Button */}
                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="mt-6 sm:mt-6 w-full py-3 rounded-xl bg-[#0A0A0A] text-white text-sm sm:text-base font-medium hover:bg-black transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSendingOtp ? "Sending..." : "Get Started"}
                  </button>
                </form>
              )}

              {/* STEP 2: OTP FORM */}
              {step === "otp" && (
                <form
                  onSubmit={handleOtpSubmit}
                  className="flex flex-col flex-1"
                >
                  <div className="flex flex-col flex-1">
                    <h2 className="text-xl sm:text-2xl font-semibold text-[#1C3141] mb-2">
                      Enter the code we texted you
                    </h2>

                    <p className="text-sm sm:text-base text-[#4B5563] mb-4 sm:mb-5">
                      We’ve sent an SMS to {formattedPhone}
                    </p>

                    {/* OTP Input */}
                    <div className="w-full mb-3">
                      <label
                        htmlFor="otp"
                        className="block text-sm font-medium text-[#4B5563] mb-1"
                      >
                        SMS code
                      </label>

                      <div className="border border-[#CBD5E1] rounded-xl px-3 py-2.5 sm:py-3 bg-white">
                        <input
                          id="otp"
                          type="tel"
                          maxLength={6}
                          value={otp}
                          onChange={(e) =>
                            setOtp(e.target.value.replace(/\D/g, ""))
                          }
                          placeholder="123 456"
                          className="w-full bg-transparent outline-none text-sm sm:text-base text-[#111827] placeholder:text-[#9CA3AF]"
                        />
                      </div>
                      {otpError && (
                        <p className="mt-1 text-xs text-red-500">{otpError}</p>
                      )}
                    </div>

                    <p className="text-xs text-[#6B7280] mb-1">
                      Your 6 digit code is on its way. This can sometimes take a
                      few moments to arrive.
                    </p>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isSendingOtp}
                      className="text-sm cursor-pointer text-[#0369A1] font-medium hover:underline w-fit mt-1 disabled:opacity-60"
                    >
                      {isSendingOtp ? "Resending..." : "Resend code"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifyingOtp}
                    className="mt-6 sm:mt-6 w-full py-3 rounded-xl bg-[#0A0A0A] text-white text-sm sm:text-base font-medium hover:bg-black transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isVerifyingOtp ? "Verifying..." : "Get Started"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
