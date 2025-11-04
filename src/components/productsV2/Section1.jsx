import './Section1.css';
import ShineGlassButton from '../common/button/ShineGlassButton';
import ProductsLeft from './ProductsLeft'; // iJewel viewer - local models
import ProductsLeftDrive from './ProductsLeftDrive'; // iJewel Drive - cloud models (TEST)
// import ProductsLeft2 from './ProductsLeft2'; // quocti_dancefloor viewer (realistic rendering)

const Section1 = ({ productConfig }) => {
    // const handleScrollDown = () => {
    //     const section2 = document.querySelector('.pv2-section2-container');
    //     if (section2) {
    //         section2.scrollIntoView({ behavior: 'smooth', block: 'start' });
    //     }
    // };

    return (
        <div className="pv2-section1">
            {/* <div className="pv2-section1-container"> */}
                {/* Left Arrow Button - Hiển thị trên desktop để điều hướng giữa các sản phẩm */}
                {/* <div className="pv2-section1-arrow-btn pv2-section1-arrow-left" style={{ transform: 'none', transition: 'none' }}>
                    <ShineGlassButton
                        width={56}
                        height={56}
                        theme="footer"
                    >
                        <svg width="24" height="24" viewBox="0 0 31 31" fill="none">
                            <path d="M24.25 15.5L6.75 15.5M6.75 15.5L14.25 8M6.75 15.5L14.25 23" stroke="gray" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="square" />
                        </svg>
                    </ShineGlassButton>
                </div> */}

                {/* Right Arrow Button - Hiển thị trên desktop để điều hướng giữa các sản phẩm */}
                {/* <div className="pv2-section1-arrow-btn pv2-section1-arrow-right" style={{ transform: 'none', transition: 'none' }}>
                    <ShineGlassButton
                        width={56}
                        height={56}
                        theme="footer"
                    >
                        <svg width="24" height="24" viewBox="0 0 31 31" fill="none">
                            <path d="M6.75 15.5L24.25 15.5M24.25 15.5L16.75 23M24.25 15.5L16.75 8" stroke="gray" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="square" />
                        </svg>
                    </ShineGlassButton>
                </div> */}

                {/* Loading Model Area - Khu vực hiển thị 3D viewer */}
                {/* <div className="pv2-model-area"> */}
                    {/* ORIGINAL - Local models with iJewel SDK */}
                    {/* <ProductsLeft /> */}

                    {/* iJewel Drive cloud models with shape selection */}
                    {/* <ProductsLeftDrive modelId={productConfig?.modelId} />
                </div> */}

                {/* Scroll Down Button - Bottom Center - Nút scroll xuống section tiếp theo (chỉ hiển thị trên mobile) */}
                {/* <div className="pv2-section1-scroll-btn">
                    <ShineGlassButton
                        variant="circle"
                        width={46}
                        height={46}
                        onClick={handleScrollDown}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 5L10 15M10 15L6 11M10 15L14 11" stroke="rgba(0, 0, 0, 0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </ShineGlassButton>
                </div>
            </div> */}
        </div>
    );
};


export default Section1;