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
    <div className='min-h-screen bg-linear-to-br from-gray-50 to-emerald-50 py-10'>
        <div className=''>
            {/* 9 07 27 */}
        </div>
    </div>
  )
}

export default InterviewHistory
