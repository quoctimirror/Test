import NavbarV3 from "@components/navbar/NavbarV3";
import CollectionHeroSection from "@components/collections/CollectionHeroSection";
import "./NavbarV3TestPage.css";

export default function NavbarV3TestPage() {
  return (
    <>
      <NavbarV3 />
      <div className="navbar-v3-test-page" data-navbar-theme="blend">
        <CollectionHeroSection />
      </div>
    </>
  );
}
