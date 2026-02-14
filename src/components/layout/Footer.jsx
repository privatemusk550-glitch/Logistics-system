import group from '@/assets/images/group-11195.png'
import facebook from '@/assets/images/facebook.png'
import instagram from '@/assets/images/instagram.png'
import telegram from '@/assets/images/telegram.png'
import linkedin from '@/assets/images/linkedin.png'
import tiktok from '@/assets/images/tik-tok.png'
import { Link } from 'react-router-dom'




const Footer = () => {
    return ( 
        <>
        <footer className="bg-black p-4 rounded larg:flex justify-between larg:h-28">
            <img src={group} alt="" className="p-2 w-44  larg:h-20"/>
           <div className="text-aramexRed larg:flex">
            <Link to='/About'> <p className="p-2 border-b border-gray-600 larg:border-none cursor-pointer larg:hover:text-white "> About Aramex</p></Link>
            <p className="p-2 border-b border-gray-600 larg:border-none cursor-pointer larg:hover:text-white">Terms Of Use</p>
            <p className="p-2 border-b border-gray-600 larg:border-none cursor-pointer larg:hover:text-white">Terms And Conditions</p>
            <p className="p-2 border-b border-gray-600 larg:border-none cursor-pointer larg:hover:text-white">Cookie Policy</p>
           </div>
           <div id="logos" className="p-2 flex gap-2">
            <img src={facebook} alt="" className="h-10 p-1 "/> 
            <img src={instagram} alt="" className="h-10 p-1 "/> 
            <img src={telegram} alt="" className=" h-10 p-1 "/> 
            <img src={linkedin} alt="" className="h-10 p-1 "/> 
            <img src={tiktok} alt="" className="h-10 p-1 "/> 
            <div id="copyright" className="hidden larg:block absolute mt-10">
            <p className="text-white text-xs">© Arramex 2025. All rights reserved.</p>
           </div>
           </div>
           <div id="copyright" className="larg:hidden">
            <p className="text-white text-xs">© Arramex 2025. All rights reserved.</p>
           </div>
        </footer>
        </>
     );
}
 
export default Footer;