"use client";

import HomeLayout from "@/components/HomeLayout";
import { useRouter } from "next/navigation";
import ProtectedLayout from "./protected/layout"


export default function HomePage() {
  const router = useRouter();
  return (
    
    <HomeLayout>
      {/* Title */}
      <h1 className="text-center text-2xl font-semibold text-slate-900 mb-8">
        Ancient Indian History MCQ
      </h1>

      {/* Top stats card */}
      <section className="mx-auto max-w-3xl bg-slate-900 text-white rounded-lg p-6 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-300">
              Total MCQ&apos;
            </p>
            <p className="text-3xl font-bold mt-1">10</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-300">
              Total marks
            </p>
            <p className="text-3xl font-bold mt-1">10</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-300">
              Total time
            </p>
            <p className="text-3xl font-bold mt-1">10:00</p>
          </div>
        </div>
      </section>

      {/* Instructions */}
      <section className="mx-auto max-w-3xl mt-6 bg-white rounded-lg p-6 shadow-sm">
        <h2 className="font-semibold mb-3 text-slate-900">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
          <li>You have 10 minutes to complete the test.</li>
          <li>Test consists of 10 multiple-choice Q&apos;s.</li>
          <li>You are allowed 2 retest attempts if you do not pass on the first try.</li>
          <li>Each incorrect answer will incur a negative mark of -1/4.</li>
          <li>Ensure you are in a quiet environment and have a stable internet connection.</li>
          <li>Keep an eye on the timer, and try to answer all questions within the given time.</li>
          <li>Do not use any external resources such as dictionaries, websites, or assistance.</li>
          <li>Complete the test honestly to accurately assess your proficiency level.</li>
          <li>Check answers before submitting.</li>
          <li>
            Your test results will be displayed immediately after submission, indicating whether
            you have passed or need to retake the test.
          </li>
        </ol>

        <div className="mt-6 flex justify-center">
          <button
      className="px-8 py-2 rounded-md bg-slate-900 text-white font-medium hover:bg-slate-800 cursor-pointer"
      onClick={() => router.push("/exam")}
    >
      Start Test
    </button>
        </div>
      </section>
    </HomeLayout>
  );
}
