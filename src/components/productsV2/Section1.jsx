import './Section1.css';
import ShineGlassButton from '@components/common/button/ShineGlassButton';
import ProductsLeftDrive from './ProductsLeftDrive';
import { PRODUCT_CONFIG } from './productConfig';

const Section1 = ({ productConfig }) => {
    const handleScrollDown = () => {
        const section2 = document.querySelector('.pv2-section2-container');
        if (section2) {
            section2.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const modelId = productConfig?.modelId || PRODUCT_CONFIG.defaultModelId;

    return (
        <div className="pv2-section1">
            <div className="pv2-model-area">
                <ProductsLeftDrive modelId={modelId} />
            </div>

            <div className="pv2-section1-scroll-btn">
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
        </div>
    );
};


export default Section1;