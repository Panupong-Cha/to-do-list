"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { BiChevronsUp } from "react-icons/bi";

export default function Home() {
  const statuses = ["TODO", "DOING", "DONE"];
  const [status, setStatus] = useState<string>("TODO");

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const offset = 0;
  const limit = 30;

  const fetchTasks = async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://todo-list-api-mfchjooefq-as.a.run.app/todo-list?status=${status}&offset=${offset}&limit=${limit}&sortBy=createdAt&isAsc=true`
      );

      console.log("API Response:", response.data);

      if (response.data && Array.isArray(response.data.tasks)) {
        setTasks(response.data.tasks);
      } else {
        setError(
          "Expected an array of tasks, but received a different format."
        );
        console.error("Unexpected data format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to fetch tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(status);
  }, [status]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const groupByDate = (tasks: any[]) => {
    const grouped = tasks.reduce((acc: { [key: string]: any[] }, task) => {
      const date = task.createdAt.split("T")[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {});

    return grouped;
  };

  const groupedTasks = groupByDate(tasks);

  return (
    <>
      <nav className="bg-[#D1E9F6] text-black">
        <div className="flex items-center justify-center p-5">
          <h1 className="font-bold text-xl">My Task</h1>
        </div>
      </nav>

      <div className="flex flex-col items-center p-5">
        <div className="flex space-x-3 bg-gray-100 rounded-3xl p-2 w-full lg:w-1/2 mb-5">
          {statuses.map((tab) => (
            <button
              key={tab}
              className={`flex-1 transition-all duration-200 font-bold rounded-3xl p-2 ${
                status === tab
                  ? "bg-pink-200 text-black"
                  : "hover:bg-purple-100 text-gray-400"
              }`}
              onClick={() => setStatus(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : Object.keys(groupedTasks).length > 0 ? (
          Object.keys(groupedTasks).map((date) => (
            <div key={date} className="w-full lg:w-1/2 mb-4">
              <div className="font-bold text-base mb-2 text-black">
                {new Date(date).toUTCString().substring(4, 16)}
              </div>
              {groupedTasks[date].map((task: any) => (
                <div
                  key={task.id}
                  className="border rounded-xl p-3 mb-4"
                  draggable="false"
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold text-black">
                      {task.title}
                    </span>
                    <span className="text-gray-500">
                      {new Date(task.createdAt).toUTCString().substring(16, 22)}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">{task.description}</p>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p>No tasks found.</p>
        )}
      </div>
      <button
        className={`fixed bottom-5 right-5 p-3 bg-blue-500 text-white rounded-full transition-opacity duration-300 ${
          showBackToTop ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <BiChevronsUp size={24} />
      </button>
    </>
  );
}
