import logo from '@/assets/images/aramex-logo-english.webp';
import translate from '@/assets/icons/translate.png'
import pin from '@/assets/icons/pin.png'
import  Menu  from '@/assets/icons/burger.png';
import banner from '@/assets/images/homepageen80773f4d-2dce-418c-8612-1d7862fe5f68.webp'
import { useState } from 'react';
import { Link } from 'react-router-dom';




const Header = () => {
    const [isOpen, setIsOpen] = useState(false)
    const handleclick = ()=>{
        if (isOpen) {
            setIsOpen(false)
        } else
        {
            setIsOpen(true)
        }
    }
    return ( 
        <>
        <header className="flex justify-between gap-3 bg-white">
           <div id="logo">
            <img src= {logo} alt="company-banner" className ="w-name p-3 larg:w-56" />
           </div>
           <div id="desktop-menu" className=" hidden gap-4 p-3 text-[16px] font-medium  rounded-md larg:flex ">
            <p className="hover:text-aramexRed  cursor-pointer border-aramexRed hover:border-b"> Ship and track</p>
            <a href="#" className =" hover:text-aramexRed  cursor-pointer border-aramexRed hover:border-b">Solutions</a>
            <Link to ='/About'><p className="hover:text-aramexRed cursor-pointer border-aramexRed hover:border-b">About us </p></Link>
            </div>
            <div className="hidden text-gray-400 p-3 gap-2 larg:flex ">
                <span className="flex text-[14px]">
                    <img src= {translate} alt="Translation" className="h-7" />
                    <div id="google_translate_element">
                  <select id="languageSwitcher" onChange={null}>
                    <option value="">🌍 Auto Detect</option>
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="pt">Portuguese</option>
                    <option value="es">Spanish</option>
                    <option value="ar">Arabic</option>
                  </select>
              </div>
                </span>
                <span className="flex ml-3">
                    <img src={pin} alt="location-pin" className="h-7" />
                    <p>United Arab Emirates</p>
                </span>
            </div>
           <div id="moblie-menu" className=" larg:hidden " onClick={handleclick}>
            {!isOpen && <img src={Menu} alt="" className="w-14 p-2 ml-2" />}
            {isOpen && <p className=' font-semibold text-aramexRed text-3xl w-[33px] text-center mt-1 mr-3'>X</p>}

           </div>
        </header>

        <section className="h-banner flex align-baseline justify-center larg:hidden">
            {isOpen && <div id="drop-menu" className="p-3 w-input h-64 font-medium bg-white rounded-md absolute z-10 block">
            <p className="hover:text-aramexRed w-36 p-5 cursor-pointer border-aramexRed hover:border-b"> Ship and track</p>
            <p className=" hover:text-aramexRed w-24 p-5 cursor-pointer border-aramexRed hover:border-b">Solutions</p>
            <a href="About.html"><p className="hover:text-aramexRed w-32 p-5 cursor-pointer border-aramexRed hover:border-b">About us</p></a>
            </div>}
           
            <div id="banner" className ="z-0 absolute larg:hidden">
                <img src={banner} alt="" className="w-input p-1 "/>
            </div>
        </section>
        </>
     );
}
 
export default Header;