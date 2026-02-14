import delivery from '@/assets/images/delivery.png'
import calculator from '@/assets/images/calculator.png'
import headset from '@/assets/images/headset.png'
import bitmap from '@/assets/images/bitmap.webp'
import packgeImg from '@/assets/images/img-why@2x.webp'
import header from '@/assets/images/img-header.webp'


const services = [
  {
    title: 'Send a Shipment',
    desc: 'Book and manage your shipments with ease.',
    img: delivery,
  },
  {
    title: 'Get a Quote',
    desc: 'Calculate shipping costs quickly and accurately.',
    img: calculator,
  },
  {
    title: 'Customer Support',
    desc: 'We’re here to help, anytime you need us.',
    img: headset,
  },
  
]

export default function ServicesSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-2">
      <h2 className="text-2xl lg:text-3xl font-bold text-center mb-12">
        Our Services
      </h2>

      <div className="grid gap-8 md:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.title}
            className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 text-center"
          >
            <img
              src={service.img}
              alt={service.title}
              className="h-24 mx-auto mb-6"
            />
            <h3 className="font-semibold text-lg mb-2">
              {service.title}
            </h3>
            <p className="text-gray-600 text-sm">
              {service.desc}
            </p>
          </div>
        ))}
      </div>
     <section id="goals" className ="larg:grid flex flex-wrap grid-cols-3  align-middle larg:w-[760px] justify-center  mt-10 text-sm ">
         <h2 className="text-2xl text-center text-gray-700 larg:w-[750px] larg:text-3xl larg:absolute larg:-mt-1">Delivery unlimited</h2> 
        <div id="" className="flex flex-wrap align-middle justify-center gap-2 text-gray-700 larg:mt-14 p-1">
            <img src={bitmap} alt="" className="h-40 rounded-full"/> 
            <p className="w-screen text-center ">Sustainable logistics</p>
            <p className="w-input text-center text-gray-500 font-light text-sm">As a premier logistics company in the UAE, we are committed to sustainable logistics, reducing environmental impact and maximizing efficiency. Our innovative solutions promote eco-friendly operations for a greener future.</p>
        </div>
            <div id="" className="flex flex-wrap align-middle justify-center gap-2 text-gray-700 larg:mt-14 p-1">
            <img src={packgeImg} alt="" className="h-40 rounded-full"/> 
            <p className="w-screen text-center ">Flexible solutions</p>
            <p className="w-[375px] text-center text-gray-500 font-light text-sm">We offer flexible logistics solutions tailored to diverse needs. From customized shipping to scalable services, we adapt to your business, ensuring seamless and efficient operations.</p>
        </div>
        <div id="" className="flex flex-wrap align-middle justify-center gap-2 text-gray-700 larg:mt-14 p-1">
            <img src={header} alt="" className="h-40 rounded-full"/> 
            <p className="w-screen text-center ">Supply chain resilience</p>
            <p className="w-input text-center text-gray-500 font-light text-sm">Aramex enhances supply chain resilience with advanced technologies and robust strategies. Our proactive approach ensures uninterrupted operations, even amid unforeseen challenges.</p>
        </div>
       </section>
    </section>
  )
}
