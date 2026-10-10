import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";
import FlowerStory from "@/components/home/FlowerStory";
export default function Home(){return <div className="home-page"><SiteHeader/><main id="main-content" tabIndex={-1}><FlowerStory/></main><SiteFooter/></div>;}
