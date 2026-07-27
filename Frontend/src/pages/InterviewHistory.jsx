import axios from 'axios';
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ServerUrl } from '../App';

function InterviewHistory() {
    const [interviews,setInterviews] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getMyInterviews = async () => {
            try {
                const result = await axios.get(ServerUrl+"/api/interview/get-interview",{withCredentials:true})
                console.log(result.data);
                setInterviews(result.data)
            } catch (error) {
                console.log(error);
            }
        }
        getMyInterviews()
    },[])
    
  return (
    <div className='py-2'>
        <div className='max-w-4xl'>
            <div className='mb-8'>
                <h1 className='text-2xl font-bold text-gray-900'>Interview History</h1>
                <p className='text-gray-500 mt-1 text-sm'>
                    Track your past interviews and performance
                </p>
            </div>

            {interviews.length === 0 ? 
            <div className='bg-white p-10 rounded-2xl shadow text-center'>
                <p className='text-gray-500'>
                    No interviews found. Start your first interview.
                </p>
            </div> 
            
            : 
            <div className='grid gap-6'>
                {interviews.map((item,index) => (
                    <div key={index} 
                        onClick={() => navigate(`/report/${item._id}`)}
                        className='bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100'>
                        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                            <div>
                                <h3 className='text-lg font-semibold text-gray-800'>{item.role}</h3>
                                <p className='text-gray-500 text-sm mt-1'>{item.experience} • {item.role}</p>
                                <p className='text-xs text-gray-400 mt-2'>
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className='flex items-center gap-6'>

                                {/* SCORE */}
                                <div className='text-right'>
                                    <p className='text-xl font-bold text-emerald-600'>
                                        {item.finalScore || 0}/10
                                    </p>
                                    <p className='text-xs text-gray-400'>Overall Score</p>
                                </div>

                                {/* STATUS BADGE */}
                                <span className={`px-4 py-1 rounded-full text-xs font-medium ${
                                    item.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"} `}>
                                    {item.status}
                                </span>

                            </div>
                        </div>
                    </div>
                ))}
            </div>
            }
        </div>
    </div>
  )
}

export default InterviewHistory
