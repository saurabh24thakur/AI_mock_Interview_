import React from 'react'
import image_back from "../../assets/landIng_page_back.jpg"

function LandingPage() {
  return (
    <div>
        <div className="font-sans">
    

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-10 py-20">
        {/* Left Text */}
        <div className="md:w-1/2">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Ace Your Interview <br /> More Presentable
          </h1>
          <p className="text-gray-600 mb-6">
            Ace your first interview using Mockmate...
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700">
            Start Interview
          </button>
        </div>

        {/* Right Image */}
        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
          <img
            src={image_back}
            alt="Business Growth"
            className="w-108"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20 px-10 text-center">
        <h2 className="text-3xl font-semibold mb-3">Imagine Features</h2>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Box 1 */}
          <div className="bg-white p-8 rounded-2xl shadow hover:shadow-md transition">
            <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-white mx-auto mb-6">
              ⟳
            </div>
            <h3 className="text-lg font-semibold mb-3">AI Interview System</h3>
            <p className="text-gray-600 text-sm">
              It give u oppotunnity to test you in frony of Ai to ace your intervew..
            </p>
          </div>

          {/* Box 2 */}
          <div className="bg-white p-8 rounded-2xl shadow hover:shadow-md transition">
            <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-white mx-auto mb-6">
              📊
            </div>
            <h3 className="text-lg font-semibold mb-3">Full functional dashboard</h3>
            <p className="text-gray-600 text-sm">
              You can tally all your progress and old interview sessions..
            </p>
          </div>

          {/* Box 3 */}
          <div className="bg-white p-8 rounded-2xl shadow hover:shadow-md transition">
            <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-white mx-auto mb-6">
              🛒
            </div>
            <h3 className="text-lg font-semibold mb-3">Easy Purchase</h3>
            <p className="text-gray-600 text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Perferendis quis molestiae vitae eligendi at.
            </p>
          </div>
        </div>
      </section>
    </div>
      
    </div>
  )
}

export default LandingPage
