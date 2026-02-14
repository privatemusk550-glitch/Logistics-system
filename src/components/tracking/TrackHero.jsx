import banner from '@/assets/images/banner.png'
import hero from '@/assets/images/homepageen80773f4d-2dce-418c-8612-1d7862fe5f68.webp'

export default function TrackHero({
  trackingNumber,
  setTrackingNumber,
  loading,
  onSubmit,
  error,
}) {
  return (

    <main className="flex flex-wrap p-5 my-10  justify-center align-middle larg:flex-nowrap">
            <div className="larg:flex flex-wrap larg:w-flex align-middle justify-center larg:mt-28 h-[260px]">
                  <h3 className="text-3xl ml-[9%] font-bold text-aramexRed larg:block"> Track your Shipment </h3>
                <form action=""onSubmit={onSubmit} className="flex gap-1 align-middle justify-center larg:flex-nowrap ">
            <div>
                <input type="text" id="tracking-input" placeholder="Type your tracking number here " className="w-72 outline-none  p-3 shadow-lg shadow-gray-400 rounded border -600 larg:w-input larg:h-[67px]" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)}/> 
                {error && <small className="text-red-700 hidden" id="error">{error}</small>}
            </div>
                <button
          type="submit"
          disabled={loading}
          className="bg-aramexRed hover:bg-red-700 text-white font-medium rounded-md h-14 lg:h-16 px-8 transition"
        >
          {loading ? 'Searching…' : 'Track'}
        </button>
            </form>
            <div className="-ml-3 p-4 font-medium text-gray-700 ">
                <p className="text-center larg:text-left">Enter multiple tracking numbers with a space or comma.
                If your tracking number isn't working, double-check the format </p>
                <p className="text-center larg:text-left">Registered business customers can access advanced tracking </p>
            </div>      
            </div>
            <div>
                  <div id="banner" className="hidden larg:flex align-middle justify-center">
                <img src={hero} alt="" className="w-flex p-1 ml-20 mt-10 h-64"/>
            </div>
            </div>
        </main>


   
  )
}

