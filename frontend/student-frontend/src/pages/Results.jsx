import React, { useEffect, useState } from 'react';
import { useNavigate, useParams }  from 'react-router-dom'
import Sidebar from '../components/Sidebar'; 
import API from '../services/api' 

const Results = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await API.get(`/student/submissions/${testId}`);
        setResults(response.data || []);
      } catch (err) {
        setError(err.message || 'Unable to fetch results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [testId]);

  const closeModal = () => setSelectedResult(null);

  const formatDate = (value) => {
    if (!value) return 'N/A';
    if (value === '-') return '-';
    return new Date(value).toLocaleString();
  };

  return (
    <div className="app-shell">
        <Sidebar />
        <main className="main">
            <div className="min-h-screen bg-gradient-to-br p-6 sm:p-10">
                <button className="text-slate-600 text-sm hover:underline" onClick={() => navigate("/tests")}>
                ← Back
                </button>
                <div className="mx-auto mb-8 max-w-3xl text-center">
                    <h1 className="m-0 text-3xl font-semibold tracking-tight sm:text-4xl">
                        {loading ?
                            '' :
                            results[0]?.test?.title || 'No Title'}
                    </h1>
                    <p className="mt-3 text-base text-slate-600">
                        {loading ?
                            '' :
                            results[0]?.test?.description || 'No description'}
                    </p>
                </div>

                {loading && (
                    <div className="mx-auto mb-5 max-w-3xl rounded-2xl px-5 py-4 text-center">
                    Loading results...
                    </div>
                )}
                {error && (
                    <div className="mx-auto mb-5 max-w-3xl rounded-2xl bg-rose-100 px-5 py-4 text-center text-rose-700">
                    {error}
                    </div>
                )}

                {!loading && !error && results.length === 0 && (
                    <div className="mx-auto mb-5 max-w-3xl rounded-2xl bg-indigo-100 px-5 py-4 text-center text-indigo-700">
                    No submission results found.
                    </div>
                )}

                <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {results.map((result) => (
                    <div
                        key={result._id || result.id}
                        className="rounded-[24px] border border-white/70 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition duration-150 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]"
                    >
                        <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="font-semibold text-slate-900">
                               Score : {result.score ?? 'N/A'}/{result.test?.totalMarks ?? 'N/A'}
                            </span> &nbsp;
                            <span className={`px-3 py-1 rounded-full ${result.result === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {result.result}
                            </span>
                        </div>
                        </div>
                        <p className="mb-1 mt-4 min-h-[3rem] leading-7 text-slate-600">
                            Time Taken: {result.timeTakenInSeconds ? `${Math.floor(result.timeTakenInSeconds / 60)}m ${result.timeTakenInSeconds % 60}s` : 'N/A'}
                        </p>
                        <p className="mb-1 min-h-[3rem] leading-7 text-slate-600">
                            Correct: {result.correct ?? 'N/A'} | Wrong: {result.wrong ?? 'N/A'}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-4">
                        <span className="text-sm text-slate-500">Submitted: {formatDate(result.submittedAt || '-')}</span>
                        <button
                            className="rounded-full bg-indigo-700 px-4 py-2 font-semibold text-white transition hover:bg-indigo-800"
                            onClick={() => setSelectedResult(result)}
                            type="button"
                        >
                            View Details
                        </button>
                        </div>
                    </div>
                    ))}
                </div>

                {selectedResult && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-6" role="dialog" aria-modal="true">
                    <div className="h-[60vh] w-[60vw] overflow-hidden rounded-[28px] bg-white shadow-[0_26px_70px_rgba(15,23,42,0.18)]">
                        <div className="flex items-center justify-between gap-5 border-b border-slate-200 px-7 py-6">
                        <div>
                            <h2 className="m-0 text-xl font-semibold text-slate-900">
                            {selectedResult.test?.title || 'Results'}
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                            {selectedResult.test?.description || 'No description'}
                            </p>
                        </div>
                        <button className="text-3xl leading-none text-slate-700" onClick={closeModal} type="button">
                            ×
                        </button>
                        </div>
                        <div className="grid max-h-[calc(60vh-150px)] gap-4 overflow-y-auto px-7 py-6">
                            {selectedResult.answers.map(a=> (
                                <div key={a.question._id} className={`p-3 border rounded-md ${a.selected === a.question.correctOption ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                                <div className="font-medium">{a.question.questionText}</div>
                                <div className="text-sm text-gray-600">
                                    Your answer: <strong>{`${a.selected}.${a.question.options?.[a.selected]}` ?? 'No option text'}</strong> |
                                    Correct: <strong>{`${a.question.correctOption}.${a.question.options?.[a.question.correctOption]}` ?? 'No correct option text'}</strong></div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end px-7 pb-6">
                        <button className="rounded-full bg-indigo-600 px-5 py-3 font-bold text-white" onClick={closeModal} type="button">
                            Close
                        </button>
                        </div>
                    </div>
                    </div>
                )}
            </div>
        </main>
    </div>
  );
};

export default Results;
