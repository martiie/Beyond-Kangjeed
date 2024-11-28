import Link from "next/link";

const HomePage = () => {
  return (
    <div className="flex justify-start items-center min-h-screen bg-cover bg-center absolute inset-0 -z-10" style={{
      backgroundImage: "url('/img/pride_gradient_1.jpeg')"
    }}>

      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 flex justify-between items-center px-8 py-4 text-white bg-transparent">
        <h1 className="text-4xl font-bold">Love Foundation</h1>
        <div className="flex space-x-10">
          <a href="#" className="hover:underline font-extrabold text-lg">
            เกี่ยวกับเรา
          </a>
          <a href="#" className="hover:underline font-extrabold text-lg">
            ข่าวสาร
          </a>
          <a href="#" className="hover:underline font-extrabold text-lg">
            ติดต่อเรา
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col justify-start items-start px-8 lg:px-20 mt-20 text-left">
        <h1 className="text-4xl lg:text-5xl font-bold mb-6">
          การป้องกันและการ<br />ดูแลรักษาโรค HIV
        </h1>
        <p className="text-lg lg:text-3xl max-w-3xl mb-8 leading-relaxed font-light">
          HIV หรือไวรัสภูมิคุ้มกันบกพร่องเป็นไวรัสที่โจมตีระบบภูมิคุ้มกัน<br />
          ทำให้ร่างกายอ่อนแอและเสี่ยงต่อการติดเชื้อและโรคต่างๆการ<br />ติดเชื้อ
          HIV สามารถป้องกันได้ด้วยการใช้ถุงยางอนามัยทุกครั้ง<br />ที่มีเพศสัมพันธ์
          และตรวจสุขภาพเป็นประจำการรักษา HIV มีการ<br />พัฒนาอย่างต่อเนื่อง
          ช่วยให้ผู้ติดเชื้อมีชีวิตที่ยืนยาวและคุณภาพชีวิตที่ดีขึ้น
        </p>
        <div className="flex space-x-4 mt-6">
          <Link href="/estimate">
            <button className="px-8 py-3 bg-gradient-to-r from-pink-500 via-blue-500 to-purple-500 text-white text-lg font-semibold rounded-full shadow-xl hover:scale-105 transition-all duration-500 ease-in-out hover:bg-gradient-to-l hover:from-purple-500 hover:via-yellow-500 hover:to-red-500">
              ประเมินความเสี่ยง
            </button>
          </Link>
          <Link href="/chat-bot">
            <button className="relative px-20 py-6 font-semibold text-lg rounded-full shadow-xl text-black transition-transform hover:scale-105 duration-500 bg-transparent backdrop-blur-lg">
              <span className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full p-[4px] animate-[move-border_3s_linear_infinite]">
                <span className="flex items-center justify-center h-full w-full bg-gray-100 backdrop-blur-lg rounded-full">
                  ปรึกษา ChatBot
                </span>
              </span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;