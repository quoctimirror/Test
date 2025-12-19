import './Section1.css';
import ScrollDownArrow from '@components/common/button/ScrollDownArrow';
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
                <ScrollDownArrow theme="black" onClick={handleScrollDown} size={46} />
            </div>
        </div>
    );
};


export default Section1;