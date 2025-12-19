import NavbarV2 from "@components/navbar/NavbarV2";
import CollectionHeroSection from "@components/collections/CollectionHeroSection";
import "./NavbarV2TestPage.css";

export default function NavbarV2TestPage() {
  return (
    <>
      <NavbarV2 />
      <div className="navbar-v2-test-page" data-navbar-theme="blend">
        <CollectionHeroSection />
      </div>
    </>
  );
}
