import Link from 'next/link';

const HomePage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome to chat bot</h1>
        <Link href="/estimate">
          <button className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-300 hover:bg-blue-600 hover:scale-105 focus:outline-none">
            Go to Estimate
          </button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
