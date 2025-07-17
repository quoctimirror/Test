// Thêm 'useRef' vào dòng import từ React
import React, { useRef } from 'react';
import './Collection.css';
import specialButton from '../../assets/images/specialbutton.svg';

function Collection() {
    // Tạo các ref để gắn vào các section
    const section2Ref = useRef(null);
    const section3Ref = useRef(null);

    // Hàm xử lý việc cuộn từ section 1 xuống section 2
    const handleScrollToSection2 = () => {
        section2Ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Hàm xử lý việc cuộn từ section 2 xuống section 3
    const handleScrollToSection3 = () => {
        section3Ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="collection-page">
            {/* --- SECTION 1 --- */}
            <div className='section-1'>
                <div className="hero-text-container">
                    <div className="text-treasure">TREASURE</div>
                    <div className="text-of-the">of the</div>
                    <div className="text-orient">ORIENT</div>
                </div>

                {/* --- THAY ĐỔI NÚT Ở ĐÂY --- */}
                <button
                    className="scroll-down-arrow"
                    onClick={handleScrollToSection2}
                    aria-label="Scroll down" // Thêm aria-label cho khả năng truy cập
                >
                    {/* Icon mũi tên SVG thay cho chữ */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            {/* --- SECTION 2 --- */}
            <div className="section-2" ref={section2Ref}>

                {/* CỘT BÊN TRÁI (ẢNH NHẪN) */}
                <div className="collection-image-panel">
                    <img
                        src="/collections/section2-ring.png"
                        alt="Jewelry collection mood"
                    />
                </div>

                {/* CỘT BÊN PHẢI (CHỨA SLIDER) */}
                <div className="collection-content-panel">

                    {/* SLIDER SẢN PHẨM */}
                    <div className="product-slider">

                        {/* HÀNG CHỨA MŨI TÊN VÀ ẢNH */}
                        <div className="slider-main-row">
                            <button className="slider-arrow" aria-label="Previous Product">
                                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M23.75 15L6.25 15M6.25 15L13.75 7.5M6.25 15L13.75 22.5" stroke="white" strokeWidth="2" strokeLinecap="square" />
                                </svg>
                            </button>

                            <div className="product-image-container">
                                <img
                                    src="/collections/section2-pendant.png"
                                    alt="Aurora Pendant"
                                    className="product-image"
                                />
                            </div>

                            <button className="slider-arrow" aria-label="Next Product">
                                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.25 15L23.75 15M23.75 15L16.25 22.5M23.75 15L16.25 7.5" stroke="white" strokeWidth="2" strokeLinecap="square" />
                                </svg>
                            </button>
                        </div>

                        {/* KHỐI CHỨA THÔNG TIN SẢN PHẨM */}
                        <div className="product-info">
                            <h2 className="product-title">AURORA</h2>
                            <p className="product-description">
                                More than a ring, AURORA is a <br />
                                celebration of light, geometry, and the <br />
                                future you're building together.
                            </p>
                            <button className="explore-button">
                                <img src={specialButton} alt="Explore this gem" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Nút scroll down từ section 2 xuống section 3 */}
                <button
                    className="scroll-down-arrow"
                    onClick={handleScrollToSection3}
                    aria-label="Scroll to section 3"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            {/* --- SECTION 3 --- */}
            <div className="section-3" ref={section3Ref}>
                <h2 className="mirror-collection-title">Mirror Collection 3</h2>
            </div>

        </div>
    );
}

export default Collection;