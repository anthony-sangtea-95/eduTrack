import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar'; 
import API from '../services/api' 

const Results = () => {
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await API.get('/student/submissions');
        setResults(response.data || []);
      } catch (err) {
        setError(err.message || 'Unable to fetch results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const closeModal = () => setSelectedResult(null);

  const formatDate = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleString();
  };

  return (
    <div className="app-shell">
        <Sidebar />
        <main className="main">
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-100 p-6 text-slate-800 sm:p-10">
                <div className="mx-auto mb-8 max-w-3xl text-center">
                    <h1 className="m-0 text-3xl font-semibold tracking-tight sm:text-4xl">Submission Results</h1>
                    <p className="mt-3 text-base text-slate-600">Review the latest results from the Submission document.</p>
                </div>

                {loading && (
                    <div className="mx-auto mb-5 max-w-3xl rounded-2xl bg-indigo-100 px-5 py-4 text-center text-indigo-700">
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
                            <div className="mb-1.5 text-lg font-semibold text-slate-900">
                            {result.title || result.assignment || 'Submission Result'}
                            </div>
                            <div className="text-sm text-slate-500">
                            {result.studentName || result.student || 'Student not set'}
                            </div>
                        </div>
                        <div className="min-w-[72px] rounded-full bg-gradient-to-br from-indigo-600 to-indigo-500 px-3.5 py-2.5 text-center text-sm font-bold text-white">
                            {result.score ?? 'N/A'}
                        </div>
                        </div>
                        <p className="mb-4 mt-4 min-h-[3rem] leading-7 text-slate-600">
                        {result.summary || result.description || 'Tap view details to inspect full results.'}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-4">
                        <span className="text-sm text-slate-500">Submitted: {formatDate(result.submittedAt || result.createdAt)}</span>
                        <button
                            className="rounded-full bg-indigo-700 px-5 py-3 font-semibold text-white transition hover:bg-indigo-800"
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
                    <div className="w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-[0_26px_70px_rgba(15,23,42,0.18)]">
                        <div className="flex items-center justify-between gap-5 border-b border-slate-200 px-7 py-6">
                        <div>
                            <h2 className="m-0 text-xl font-semibold text-slate-900">
                            {selectedResult.title || selectedResult.assignment || 'Submission Detail'}
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                            Submitted by {selectedResult.studentName || selectedResult.student || 'Unknown'}
                            </p>
                        </div>
                        <button className="text-3xl leading-none text-slate-700" onClick={closeModal} type="button">
                            ×
                        </button>
                        </div>
                        <div className="grid gap-4 px-7 py-6">
                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4 text-slate-800">
                            <span className="font-semibold text-slate-500">Score</span>
                            <span>{selectedResult.score ?? 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4 text-slate-800">
                            <span className="font-semibold text-slate-500">Status</span>
                            <span>{selectedResult.status || 'Pending'}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4 text-slate-800">
                            <span className="font-semibold text-slate-500">Submitted At</span>
                            <span>{formatDate(selectedResult.submittedAt || selectedResult.createdAt)}</span>
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-5 py-4 text-slate-800">
                            <span className="font-semibold text-slate-500">Remarks</span>
                            <p className="mt-2 leading-7 text-slate-700">
                            {selectedResult.remarks || selectedResult.feedback || 'No additional remarks available.'}
                            </p>
                        </div>
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
