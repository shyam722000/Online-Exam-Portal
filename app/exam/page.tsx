"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/public/logo.png";
import { apiGet, apiPostForm } from "../lib/api";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  STATUS,
  setLoading,
  setFetchError,
  initializeExam,
  tick,
  setShowComprehension,
  setShowSubmitModal,
  setIsSubmitting,
  setSubmitError,
  optionSelected,
  goToQuestion as goToQuestionAction,
  markForReview,
} from "../store/examSlice";

export default function ExamPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    loading,
    fetchError,
    questions,
    currentIndex,
    answers,
    statusMap,
    remainingSeconds,
    showComprehension,
    showSubmitModal,
    isSubmitting,
    submitError,
    meta,
  } = useAppSelector((state) => state.exam);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;


  // restrict refresh

  useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = ""; // Required for Chrome
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, []);


  // ---------- LOAD QUESTIONS ----------
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        dispatch(setLoading(true));
        dispatch(setFetchError(""));

        const res = await apiGet("/question/list");

        if (!res?.success) {
          dispatch(
            setFetchError(res?.message || "Failed to load questions.")
          );
          return;
        }

        const qs = res.questions || [];

        dispatch(
          initializeExam({
            questions: qs,
            questionsCount: res.questions_count || qs.length || 0,
            totalMarks: res.total_marks || 0,
            totalTime: res.total_time || 0,
            markPerAnswer: res.mark_per_each_answer || 0,
          })
        );
      } catch (err) {
        console.error(err);
        dispatch(
          setFetchError("Something went wrong while loading questions.")
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchQuestions();
  }, [dispatch]);

  // ---------- TIMER ----------
  useEffect(() => {
    if (remainingSeconds === null) return;
    if (remainingSeconds <= 0) return;

    const id = setInterval(() => {
      dispatch(tick());
    }, 1000);

    return () => clearInterval(id);
  }, [remainingSeconds, dispatch]);

  // ---------- STATUS HELPERS ----------
  const handleOptionChange = (optionId: number) => {
    dispatch(optionSelected(optionId));
  };

  const goToQuestion = (index: number) => {
    dispatch(goToQuestionAction(index));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  };

  const handleMarkForReview = () => {
    dispatch(markForReview());
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  };

  // ---------- SUBMIT ----------
  const handleSubmitExam = async () => {
    try {
      dispatch(setIsSubmitting(true));
      dispatch(setSubmitError(""));

      const payload = questions.map((q: any, idx: number) => ({
        question_id: q.question_id,
        selected_option_id: answers[idx],
      }));

      const res = await apiPostForm("/answers/submit", {
        answers: JSON.stringify(payload),
      });

      if (!res?.success) {
        dispatch(
          setSubmitError(res?.message || "Failed to submit. Please try again.")
        );
        return;
      }

      const totalQuestions = meta.questionsCount || questions.length;
      const totalMarks =
        meta.totalMarks ||
        (meta.markPerAnswer || 1) * (meta.questionsCount || questions.length);

      const query = new URLSearchParams({
        score: String(res.score ?? 0),
        correct: String(res.correct ?? 0),
        wrong: String(res.wrong ?? 0),
        notAttended: String(res.not_attended ?? 0),
        totalQuestions: String(totalQuestions),
        totalMarks: String(totalMarks),
      });

      dispatch(setShowSubmitModal(false));
      router.push(`/result?${query.toString()}`);
    } catch (err) {
      console.error(err);
      dispatch(
        setSubmitError("Something went wrong. Please try again.")
      );
    } finally {
      dispatch(setIsSubmitting(false));
    }
  };

  const handleNextOrSubmit = () => {
    if (currentIndex === questions.length - 1) {
      dispatch(setShowSubmitModal(true));
    } else {
      handleNext();
    }
  };

  const openComprehension = () => {
    if (currentQuestion?.comprehension) {
      dispatch(setShowComprehension(true));
    }
  };

  const formatTime = (secs: number | null) => {
    if (secs === null || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case STATUS.ANSWERED:
        return "bg-green-500 text-white border border-green-700";
      case STATUS.NOT_ANSWERED:
        return "bg-red-500 text-white border border-red-700";
      case STATUS.REVIEW:
        return "bg-purple-600 text-white border border-purple-700";
      case STATUS.ANSWERED_REVIEW:
        return "bg-green-500 text-white border-[3px] border-purple-700";
      case STATUS.NOT_VISITED:
      default:
        return "bg-gray-100 text-gray-700 border border-slate-300";
    }
  };

  // stats for submit modal
  const totalQuestions = meta.questionsCount || questions.length;
  const answeredCount = questions.reduce((acc, _, idx) => {
    const st = statusMap[idx];
    if (st === STATUS.ANSWERED || st === STATUS.ANSWERED_REVIEW) return acc + 1;
    return acc;
  }, 0);
  const markedCount = questions.reduce((acc, _, idx) => {
    const st = statusMap[idx];
    if (st === STATUS.REVIEW || st === STATUS.ANSWERED_REVIEW) return acc + 1;
    return acc;
  }, 0);

  // ---------- LOADING / ERROR ----------
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#e9f4ff]">
        <p className="text-slate-700 text-sm">Loading questions...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#e9f4ff]">
        <div className="bg-white rounded-xl shadow px-6 py-4 text-sm text-red-600">
          {fetchError}
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#e9f4ff]">
        <p className="text-slate-700 text-sm">No questions found.</p>
      </div>
    );
  }

  // ---------- UI ----------
  return (
    <div className="h-screen bg-[#e9f4ff] flex flex-col overflow-hidden">
      {/* TOP BAR (if you want to use logo, add here) */}
      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col px-3 sm:px-4 lg:px-6 py-4 overflow-hidden">
        <div className="flex-1 bg-[#f5fbff] rounded-md shadow-sm border border-slate-200 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT: question panel */}
          <section className="lg:flex-[2.5] w-full border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col overflow-hidden">
            {/* header inside left */}
            <div className="px-4 sm:px-6 pt-4 pb-2 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <button
                  disabled={!currentQuestion?.comprehension}
                  onClick={openComprehension}
                  className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-sm text-[11px] sm:text-xs font-medium ${
                    currentQuestion?.comprehension
                      ? "bg-[#0075c9] text-white hover:bg-[#005ea2]"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-white/10 border border-white/30">
                    📘
                  </span>
                  <span>Read Comprehensive Paragraph</span>
                </button>

                <div className="self-start sm:self-auto text-[11px] text-slate-600 border border-slate-300 rounded px-3 py-1 bg-white">
                  {String(currentIndex + 1).padStart(2, "0")}/
                  {String(meta.questionsCount).padStart(2, "0")}
                </div>
              </div>
            </div>

            {/* middle scrollable question area */}
            <div className="flex-1 px-4 sm:px-6 pb-4 flex flex-col overflow-hidden">
              <div className="mt-3 bg-white border border-slate-200 rounded-md p-4 flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <p className="text-sm text-slate-800 mb-4">
                    {currentQuestion?.number}.{" "}
                    {currentQuestion?.question?.trim() ||
                      `Question ${currentIndex + 1}`}
                  </p>

                  {currentQuestion?.image && (
                    <div className="mb-4">
                      <img
                        src={currentQuestion.image}
                        alt="Question"
                        className="w-52 sm:w-64 h-32 sm:h-40 object-cover rounded border border-slate-200"
                      />
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 mb-2">
                    Choose the answer:
                  </p>

                  <div className="space-y-2">
                    {currentQuestion.options?.map(
                      (opt: any, idx: number) => {
                        const letter = String.fromCharCode(65 + idx);
                        const checked = answers[currentIndex] === opt.id;
                        return (
                          <label
                            key={opt.id}
                            className="flex items-center justify-between border border-slate-200 rounded px-3 py-2 text-xs sm:text-sm cursor-pointer bg-[#f9fbff] hover:bg-[#eef4ff]"
                          >
                            <span className="text-slate-800">
                              {letter}. {opt.option}
                            </span>
                            <input
                              type="radio"
                              className="h-4 w-4"
                              name={`q-${currentIndex}`}
                              checked={checked}
                              onChange={() => handleOptionChange(opt.id)}
                            />
                          </label>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* bottom buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 px-4 sm:px-6 py-3 border-t border-slate-200 bg-[#f5fbff]">
              <button
                onClick={handleMarkForReview}
                className="flex-1 cursor-pointer py-2 text-[11px] sm:text-xs font-medium rounded bg-[#7c1fa0] text-white hover:bg-[#661985]"
              >
                Mark for review
              </button>
              <button
                onClick={handlePrevious}
                className="flex-1 cursor-pointer py-2 text-[11px] sm:text-xs font-medium rounded bg-[#d0d4db] text-slate-700 hover:bg-[#c1c5cd] disabled:opacity-60"
                disabled={currentIndex === 0}
              >
                Previous
              </button>
              <button
                onClick={handleNextOrSubmit}
                className="flex-1 cursor-pointer py-2 text-[11px] sm:text-xs font-medium rounded bg-[#12324a] text-white hover:bg-[#0b2234]"
              >
                {isLastQuestion ? "Submit" : "Next"}
              </button>
            </div>
          </section>

          {/* RIGHT: question sheet + timer */}
          <aside className="lg:flex-[1] w-full lg:w-auto flex flex-col bg-[#f5fbff] border-t lg:border-t-0 lg:border-l border-slate-200 overflow-hidden">
            {/* header row */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 border-b border-slate-200">
              <div className="text-xs sm:text-[13px] font-medium text-slate-800">
                Question No. Sheet:
              </div>
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-700">
                <span>Remaining Time:</span>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#12324a] text-white font-mono text-[11px] sm:text-xs">
                  <span>⏱</span>
                  <span>{formatTime(remainingSeconds)}</span>
                </div>
              </div>
            </div>

            {/* question buttons */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex flex-wrap gap-3">
                {questions.map((q: any, idx: number) => {
                  const status = statusMap[idx];
                  const baseClass = getStatusClass(status);
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.question_id}
                      onClick={() => goToQuestion(idx)}
                      className={`h-10 w-10 rounded-lg flex items-center justify-center
                        border text-xs sm:text-sm font-semibold
                        transition-all duration-150
                        ${baseClass} ${isCurrent ? "ring-4 ring-[#0075c9]" : ""}`}
                    >
                      {q.number ?? idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* legend */}
            <div className="border-t border-slate-200 px-4 sm:px-5 py-3 bg-[#f5fbff]">
              <div className="flex flex-wrap gap-4 text-[11px] text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-green-500 border border-green-700" />
                  Attended
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-red-500 border border-red-700" />
                  Not Attended
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-purple-600 border border-purple-700" />
                  Marked For Review
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-green-500 border-[3px] border-purple-700" />
                  Answered + Review
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* COMPREHENSION MODAL */}
      {showComprehension && currentQuestion?.comprehension && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div
            className="w-full max-w-4xl mx-4 bg-white rounded-lg shadow-xl border border-sky-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-[#e6f3ff] rounded-t-lg">
              <h2 className="text-sm font-semibold text-slate-800">
                Comprehensive Paragraph
              </h2>
              <button
                onClick={() => dispatch(setShowComprehension(false))}
                className="px-4 py-1.5 cursor-pointer text-xs font-medium rounded-md bg-[#12324a] text-white hover:bg-[#0b2234]"
              >
                Minimize
              </button>
            </div>
            <div className="px-5 py-4 max-h-[65vh] overflow-y-auto text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {currentQuestion.comprehension}
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
          onClick={() => !isSubmitting && dispatch(setShowSubmitModal(false))}
        >
          <div
            className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">
                Are you sure you want to submit the test?
              </h2>
              <button
                disabled={isSubmitting}
                onClick={() => dispatch(setShowSubmitModal(false))}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="px-5 py-4 space-y-3 text-sm text-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center text-white text-xs">
                  ⏱
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <span>Remaining Time:</span>
                  <span className="font-semibold">
                    {formatTime(remainingSeconds)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-amber-500 flex items-center justify-center text-white text-xs">
                  Q
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <span>Total Questions:</span>
                  <span className="font-semibold">
                    {String(totalQuestions).padStart(3, "0")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-green-500 flex items-center justify-center text-white text-xs">
                  ✓
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <span>Questions Answered:</span>
                  <span className="font-semibold">
                    {String(answeredCount).padStart(3, "0")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-purple-600 flex items-center justify-center text-white text-xs">
                  R
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <span>Marked for review:</span>
                  <span className="font-semibold">
                    {String(markedCount).padStart(3, "0")}
                  </span>
                </div>
              </div>

              {submitError && (
                <p className="text-xs text-red-600 mt-1">{submitError}</p>
              )}
            </div>

            <div className="px-5 pb-5">
              <button
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className="w-full py-3 cursor-pointer rounded-xl bg-[#12324a] text-white text-sm font-medium hover:bg-[#0b2234] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Test"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
