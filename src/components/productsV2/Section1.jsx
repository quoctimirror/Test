import './Section1.css';
import ShineGlassButton from '../common/button/ShineGlassButton';
import greyLeftArrow from '../../assets/images/grey-left-arrow.svg';
import greyRightArrow from '../../assets/images/grey-right-arrow.svg';

const Section1 = () => {
    return (
        <div className="section1">
            <div className="section1-container">
                {/* Left Arrow Button */}
                <ShineGlassButton
                    className="section1-arrow-btn section1-arrow-left"
                    width={56}
                    height={56}
                    theme="footer"
                >
                    <img src={greyLeftArrow} alt="Previous" width="24" height="24" />
                </ShineGlassButton>

                {/* Right Arrow Button */}
                <ShineGlassButton
                    className="section1-arrow-btn section1-arrow-right"
                    width={56}
                    height={56}
                    theme="footer"
                >
                    <img src={greyRightArrow} alt="Next" width="24" height="24" />
                </ShineGlassButton>

                {/* Loading Model Area */}
                <div className="model-area">
                    <p>Loading model area</p>
                </div>
            </div>
        </div>
    );
};


export default Section1;