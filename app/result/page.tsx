"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import logo from "@/public/logo.png";

export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const score = Number(searchParams.get("score") || 0);
  const totalMarks = Number(searchParams.get("totalMarks") || 0);
  const totalQuestions = Number(searchParams.get("totalQuestions") || 0);
  const correct = Number(searchParams.get("correct") || 0);
  const wrong = Number(searchParams.get("wrong") || 0);
  const notAttended = Number(searchParams.get("notAttended") || 0);

  const totalToShow = totalMarks || totalQuestions;

  return (
    <div className="min-h-screen bg-[#e9f4ff] flex flex-col">
   

      {/* MAIN CONTENT */}
      <main className="flex-1 flex items-start sm:items-center justify-center px-4 py-8 relative">
        <div className="w-full max-w-md relative z-10">
          {/* SCORE CARD with gradient */}
          <div className="rounded-xl bg-gradient-to-b from-[#177A9C] to-[#1C3141] text-center px-10 py-7 shadow-md relative z-10">
  <p className="text-xs sm:text-sm font-semibold text-white">
    Marks Obtained:
  </p>
  <p className="text-4xl sm:text-5xl font-bold text-white mt-2">
    {String(score).padStart(3, "0")} / {String(totalToShow).padStart(3, "0")}
  </p>
</div>


          {/* STATS CARD */}
          <div className="bg-red rounded-xl shadow-md px-6 py-6 mt-4 space-y-3 text-slate-900 text-sm">
            {/* Total Questions */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-[#facc15]" />
                <span>Total Questions:</span>
              </div>
              <span className="font-bold">
                {String(totalQuestions).padStart(3, "0")}
              </span>
            </div>

            {/* Correct */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-[#22c55e]" />
                <span>Correct Answers:</span>
              </div>
              <span className="font-bold">
                {String(correct).padStart(3, "0")}
              </span>
            </div>

            {/* Incorrect */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-[#ef4444]" />
                <span>Incorrect Answers:</span>
              </div>
              <span className="font-bold">
                {String(wrong).padStart(3, "0")}
              </span>
            </div>

            {/* Not Attended */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-[#6b7280]" />
                <span>Not Attended Questions:</span>
              </div>
              <span className="font-bold">
                {String(notAttended).padStart(3, "0")}
              </span>
            </div>

            {/* Done button */}
            <div className="pt-3">
              <button
                onClick={() => router.push("/login")}
                className="w-full py-2 rounded-md cursor-pointer bg-[#12324a] text-white text-sm font-medium hover:bg-[#0b2234]/90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
