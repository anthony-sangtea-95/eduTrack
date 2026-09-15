import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    assigned: 0,
    completed: 0,
    pending: 0,
    passed: 0,
    failed: 0,
    averageScore: 0,
    totalTimeInSeconds: 0,
  });

  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await API.get("/student/dashboard");

        setStats(res.data.stats || {});
        setRecentSubmissions(res.data.recentSubmissions || []);

      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const formatTime = (seconds = 0) => {
    if (seconds === 0) return '-'
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600)
      const mins = Math.floor((seconds % 3600) / 60)
      const secs = Math.floor((seconds % 3600) % 60)
      return `${hours}h ${mins}m ${secs}s`
    }
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}m ${secs}s`
    }
    return `${seconds}s`
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main">

        <div className="header">
          <h1>Student Dashboard</h1>
          <p>Overview of your tests and performance</p>
        </div>

        {/* Dashboard Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 mb-6">

          {/* Assigned Tests */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Assigned Tests
                </p>
                {loading ? (
                  <div className="mt-2 h-8 w-12 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <h3 className="mt-2 text-3xl font-bold text-gray-800">
                    {stats.assigned}
                  </h3>
                )}
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 text-xl">
                📚
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Total assigned
            </p>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pending
                </p>
                {loading ? (
                  <div className="mt-2 h-8 w-12 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <h3 className="mt-2 text-3xl font-bold text-gray-800">
                    {stats.pending}
                  </h3>
                )}
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600 text-xl">
                ⏳
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Waiting to complete
            </p>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Completed
                </p>
                {loading ? (
                  <div className="mt-2 h-8 w-12 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <h3 className="mt-2 text-3xl font-bold text-gray-800">
                    {stats.completed}
                  </h3>
                )}
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600 text-xl">
                ✓
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Tests completed
            </p>
          </div>

          {/* Passed */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Passed
                </p>
                {loading ? (
                  <div className="mt-2 h-8 w-12 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <h3 className="mt-2 text-3xl font-bold text-gray-800">
                    {stats.passed}
                  </h3>
                )}
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-xl">
                🏆
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Successful tests
            </p>
          </div>

          {/* Failed */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Failed
                </p>
                {loading ? (
                  <div className="mt-2 h-8 w-12 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <h3 className="mt-2 text-3xl font-bold text-gray-800">
                    {stats.failed}
                  </h3>
                )}
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 text-xl">
                !
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Needs improvement
            </p>
          </div>

          {/* Average Score */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Average Score
                </p>
                {loading ? (
                  <div className="mt-2 h-8 w-16 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <h3 className="mt-2 text-3xl font-bold text-gray-800">
                    {stats.averageScore}%
                  </h3>
                )}
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 text-xl">
                ⭐
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Overall performance
            </p>
          </div>

          {/* Total Time */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Time
                </p>

                {loading ? (
                  <div className="mt-2 h-8 w-20 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <h3 className="mt-2 text-3xl font-bold text-gray-800">
                    {formatTime(stats.totalTimeInSeconds)}
                  </h3>
                )}
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 text-xl">
                ⏱
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Time spent testing
            </p>
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="card mt-3">

          <div className="header">
            <h2>Recent Attempts</h2>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : recentSubmissions.length === 0 ? (
            <p>No test attempts yet.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">

                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Correct</th>
                    <th>Wrong</th>
                    <th>Time</th>
                    <th>Result</th>
                  </tr>
                </thead>

                <tbody>
                  {recentSubmissions.map(sub => (
                    <tr key={sub._id}>

                      <td>{sub.title}</td>

                      <td>
                        {sub.score} / {sub.totalMarks}
                      </td>

                      <td>
                        {sub.percentage}%
                      </td>

                      <td>
                        {sub.correct}
                      </td>

                      <td>
                        {sub.wrong}
                      </td>

                      <td>
                        {formatTime(sub.timeTakenInSeconds)}
                      </td>

                      <td>
                        {sub.passed ? (
                          <span className="badge success">
                            Passed
                          </span>
                        ) : (
                          <span className="badge danger">
                            Failed
                          </span>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}