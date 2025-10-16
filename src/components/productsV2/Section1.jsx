import './Section1.css';
import ShineGlassButton from '../common/button/ShineGlassButton';
import ProductsLeft from './ProductsLeft';

const Section1 = () => {
    return (
        <div className="pv2-section1">
            <div className="pv2-section1-container">
                {/* Left Arrow Button */}
                <div className="pv2-section1-arrow-btn pv2-section1-arrow-left" style={{ transform: 'none', transition: 'none' }}>
                    <ShineGlassButton
                        width={56}
                        height={56}
                        theme="footer"
                    >
                        <svg width="24" height="24" viewBox="0 0 31 31" fill="none">
                            <path d="M24.25 15.5L6.75 15.5M6.75 15.5L14.25 8M6.75 15.5L14.25 23" stroke="gray" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="square" />
                        </svg>
                    </ShineGlassButton>
                </div>

                {/* Right Arrow Button */}
                <div className="pv2-section1-arrow-btn pv2-section1-arrow-right" style={{ transform: 'none', transition: 'none' }}>
                    <ShineGlassButton
                        width={56}
                        height={56}
                        theme="footer"
                    >
                        <svg width="24" height="24" viewBox="0 0 31 31" fill="none">
                            <path d="M6.75 15.5L24.25 15.5M24.25 15.5L16.75 23M24.25 15.5L16.75 8" stroke="gray" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="square" />
                        </svg>
                    </ShineGlassButton>
                </div>

                {/* Loading Model Area */}
                <div className="pv2-model-area">
                    <ProductsLeft />
                </div>
            </div>
        </div>
    );
};


export default Section1;