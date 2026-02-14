import Header from './Header'
import banner from '@/assets/images/banner.png'
import Footer from './Footer';
const About = () => {
    return ( 
        <>
        <Header/>
        <div className=' w-screen h-[370px]  items-center '>
            <div className=' z-10 absolute h-[360px] bg-black w-full bg-opacity-50'></div>
            <img src={banner} alt="" className=' z-0 absolute h-[360px]'/>
        </div>
        <main className="p-3 flex flex-wrap gap-6 justify-center align-middle text-gray-800 ">
            <h1 className="text-4xl font-semibold text-aramexRed">About Aramex</h1>
            <div className="flex flex-wrap justify-center align-middle">
                <h2 className="text-3xl p-5 text-gray-700 font-medium text-center larg:w-full">The company</h2>
                <div id="content" className="text-gray-800 flex flex-wrap justify-center align-middle gap-3 px-5 larg:px-24">
                    <p>
                        Founded in 1982, Aramex has emerged as a global leader in logistics and transportation, renowned for its innovative services tailored to businesses and consumers. As a listed company on the Dubai Financial Market (since 2005) and headquartered in the UAE, our strategic location facilitates extensive customer reach worldwide, bridging the gap between East and West.
                    </p>
                    <p>
                       With operations in 600+ cities across 70 countries, Aramex employs over 16,000 professionals. Our success is attributed to four distinct business products that provide scalable, diversified, and end-to-end services for customers. These products are: 
                    </p>
                    <ul className="list-disc">
                        <li>International Express, encompassing Aramex's Parcel Forwarding Business (Shop &amp; Ship and MyUS).</li>
                        <li>Domestic Express</li>
                        <li>Freight Forwarding</li>
                        <li>Logistics &amp; Supply Chain Solutions</li>
                    </ul>
                    <p>
                      Sustainability is at the core of our vision and mission. To build a truly sustainable business, we leverage our core competencies to make a positive impact as responsible members of the communities we serve. Through partnerships with local and international organizations, we strive to expand our reach and benefit more individuals through targeted programs and initiatives. To address environmental concerns and combat climate change, we are aiming for Carbon-Neutrality by 2030 and Net-Zero emissions by 2050.  
                    </p>
                   <div className="hidden larg:block">
                <h3 className="text-aramexRed text-lg text-center font-semibold"> Key Values &amp; Purpose (Corporate Culture)</h3>
                <ul className="list-disc">
                    <li>According to its South African arm, Aramex values creativity, innovation, entrepreneurship, and people.</li>
                    <li>
                     Purpose (Aramex SA): “To enable and facilitate regional and global trade and commerce   
                    </li>
                    <li>
                       Corporate activism: They are involved in social projects (youth empowerment, education) and environmental initiatives. 
                    </li>
                </ul>
                <h3 className="text-aramexRed text-lg text-center font-semibold">Why Aramex Matters</h3>
                <ul className="list-disc">
                    <li>For Businesses: Offers scalable logistics solutions; good for SMEs, e-commerce companies, and large enterprises.</li>
                    <li>For Consumers: Reliable global delivery option; especially useful for cross-border shopping.</li>
                    <li>For Emerging Markets: Helps facilitate trade by offering logistics infrastructure without requiring local businesses to build their own.</li>
                </ul>
            </div>
                </div>
            </div>
        </main>
        <Footer/>
        </>
     );
}
 
export default About;