import React from 'react'

function AuthLayout() {
  return (
    <div>
       <div className="flex min-h-screen">
      {/* Left Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-10">
        <div className="w-full max-w-md"></div>
      </div>

      {/* Right Image Section */}
      <div className="hidden md:block md:w-1/2">
        <img
          src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e"
          alt="auth"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
    </div>
  )
}

export default AuthLayout
