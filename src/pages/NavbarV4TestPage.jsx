import NavbarV4 from "@components/navbar/NavbarV4";
import "./NavbarV4TestPage.css";

export default function NavbarV4TestPage() {
  return (
    <>
      <NavbarV4 />
      <div className="navbar-v4-test-page">
        {/* Section 1 - Dark background, white navbar */}
        <section className="test-section section-dark" data-navbar-theme="white">
          <div className="section-content">
            <h1>Section 1 - Dark Background</h1>
            <p>Navbar should have white text/icons</p>
            <p>Scroll down to see horizontal menu transform to menu button</p>
          </div>
        </section>

        {/* Section 2 - Light background, black navbar */}
        <section className="test-section section-light" data-navbar-theme="black">
          <div className="section-content">
            <h1>Section 2 - Light Background</h1>
            <p>Navbar should have black text/icons</p>
          </div>
        </section>

        {/* Section 3 - Medium background, white navbar */}
        <section className="test-section section-medium" data-navbar-theme="white">
          <div className="section-content">
            <h1>Section 3 - Medium Background</h1>
            <p>Navbar should have white text/icons</p>
          </div>
        </section>

        {/* Section 4 - Blend mode */}
        <section className="test-section section-gradient" data-navbar-theme="blend">
          <div className="section-content">
            <h1>Section 4 - Gradient Background</h1>
            <p>Navbar should use blend mode</p>
          </div>
        </section>

        {/* Section 5 - Dark again */}
        <section className="test-section section-dark" data-navbar-theme="white">
          <div className="section-content">
            <h1>Section 5 - Dark Background</h1>
            <p>Test complete - scroll back to top!</p>
          </div>
        </section>
      </div>
    </>
  );
}
