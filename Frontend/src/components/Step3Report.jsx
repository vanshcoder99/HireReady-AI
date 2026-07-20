import React from 'react'

function Step3Report({report}) {
   if(!report){
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-gray-500 text-lg'>
          Loading Report...
        </p>
      </div>
    );
  }

  

  return (
    <div>
      step3
    </div>
  )
}

export default Step3Report