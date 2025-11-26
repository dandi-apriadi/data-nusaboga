import React, { useState, useEffect, useRef } from 'react';
import { BsPlus, BsDash, BsCart4, BsX, BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import NftCard from 'components/card/NftCard-like';
import { useSelector } from 'react-redux';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { API_CONFIG } from 'utils/apiConfig';

// Price parsing helper function
const parsePrice = (price) => {
    try {
        if (typeof price === 'number') {
            return price;
        }

        if (typeof price === 'string') {
            return Number(price.replace(/[^0-9]/g, ''));
        }

        return 0;
    } catch (error) {
        console.error('Price parsing error:', error);
        return 0;
    }
};

// Add at the top with other utility functions
const formatToRupiah = (price) => {
    try {
        // Convert to integer and remove decimals
        const numPrice = Math.round(Number(price));

        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })
            .format(numPrice)
            .replace(/\s+/g, '') // Remove spaces
            .replace(/,00$/, ''); // Remove trailing decimals
    } catch (error) {
        console.error('Price formatting error:', error);
        return 'IDR 0';
    }
};

// Original price display
const displayOriginalPrice = (product) => {
    const price = parsePrice(product?.price);
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
};

// Calculate total with quantity
const calculateTotal = (skuPrice, qty) => {
    if (!skuPrice) return 'Select SKU first';

    // Parse values as integers
    const price = Math.round(Number(skuPrice));
    const quantity = Math.round(Number(qty));

    // Calculate total
    const total = price * quantity;

    return formatToRupiah(total);
};

const ProductModal = ({
    product,
    show,
    onClose,
    onAddToCart,
    isBuyNow = false,
    selectedVariant,
    selectedSku,
    onVariantSelect,
    onSkuSelect,
    quantity = 1,
    setQuantity
}) => {
    // Essential states
    const [gallery, setGallery] = useState([]);
    const [mainImage, setMainImage] = useState(null);
    const [productData, setProductData] = useState(null);
    const [variants, setVariants] = useState([]);
    const [benefits, setBenefits] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Essential refs for scrolling
    const galleryRef = useRef(null);
    const variantRef = useRef(null);
    const skuRef = useRef(null);

    const { baseURL } = useSelector((state) => state.auth);

    // Reset state when modal closes
    const handleClose = () => {
        if (setQuantity) setQuantity(1);
        if (onVariantSelect) onVariantSelect(null);
        if (onSkuSelect) onSkuSelect(null);
        setMainImage(null);
        setProductData(null);
        setVariants([]);
        setBenefits([]);
        setGallery([]);
        onClose();
    };

    // Combined fetch for product details
    useEffect(() => {
        const fetchProductData = async () => {
            if (show && product) {
                setIsLoading(true);
                try {
                    const response = await baseURL.get(`${API_CONFIG.ENDPOINTS.PRODUCT_DETAIL_VARIANTS}/${product.product_id}`);
                    setProductData(response.data.product);
                    setGallery(response.data.gallery || []);
                    setVariants(response.data.variants || []);
                    setBenefits(response.data.benefits || []);
                    setMainImage(product.image);
                } catch (error) {
                    console.error('Error fetching product data:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchProductData();
    }, [show, product, baseURL]);

    // Use handleClose instead of direct reset
    useEffect(() => {
        if (!show) {
            handleClose();
        }
    }, [show]);

    // Add PropTypes validation
    ProductModal.propTypes = {
        product: PropTypes.shape({
            product_id: PropTypes.string,
            name: PropTypes.string,
            price: PropTypes.number,
            image: PropTypes.string
        }),
        show: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        onAddToCart: PropTypes.func.isRequired,
        isBuyNow: PropTypes.bool,
        selectedVariant: PropTypes.object,
        selectedSku: PropTypes.object,
        onVariantSelect: PropTypes.func.isRequired,
        onSkuSelect: PropTypes.func.isRequired,
        quantity: PropTypes.number,
        setQuantity: PropTypes.func.isRequired
    };

    const scrollGallery = (direction) => {
        if (galleryRef.current) {
            const scrollAmount = 150; // Increased for larger thumbnails
            galleryRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const scrollVariant = (direction) => {
        if (variantRef.current) {
            const scrollAmount = 100;
            variantRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Add this function before the return statement, with other handlers
    const scrollSku = (direction) => {
        const container = skuRef.current;
        if (!container) return;

        const scrollAmount = 300; // Adjust scroll distance as needed
        const scrollPosition = direction === 'left'
            ? container.scrollLeft - scrollAmount
            : container.scrollLeft + scrollAmount;

        container.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    };

    // Update variant selection handler
    const handleVariantSelect = (variant) => {
        // Add defensive checks before calling the functions
        if (typeof onVariantSelect === 'function') {
            onVariantSelect(variant);
        } else {
            console.warn('onVariantSelect is not a function or not provided');
        }

        if (typeof onSkuSelect === 'function') {
            onSkuSelect(null); // Reset SKU when new variant is selected
        }

        // Add null check for variant
        if (variant && variant.img_url) {
            setMainImage(variant.img_url);
        }
    };

    const renderModalButtons = () => (
        <div className="flex gap-4">
            <button
                onClick={() => {
                    onAddToCart({ ...product, quantity, selectedSku });
                    onClose();
                }}
                disabled={!selectedSku}
                className={`w-full py-4 font-semibold rounded-xl transition-all duration-200 
        flex items-center justify-center gap-2
        ${!selectedSku
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-navy-700/50 dark:text-gray-500'
                        : 'bg-brand-500 hover:bg-brand-600 text-white hover:shadow-lg'
                    }`}
            >
                <BsCart4 className="w-5 h-5" />
                Add to Cart
            </button>
        </div>
    );

    if (!show || !product) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 
            backdrop-blur-sm bg-black/30 transition-all duration-300 overflow-y-auto"
            onClick={onClose}
        >
            <div className="bg-white dark:bg-navy-900 rounded-3xl w-full max-w-[95%] 
                md:max-w-4xl mt-20 md:mt-0 shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
                border border-gray-100 dark:border-indigo-900/30 transform 
                transition-all duration-300 overflow-hidden animate-modal-slide-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col md:flex-row">
                    {/* Left Section - Image and Gallery */}
                    <div className="w-full md:w-1/2 relative bg-gray-50 dark:bg-navy-950">
                        {/* Main Image */}
                        <div className="relative aspect-square w-full">
                            <img
                                src={mainImage || product.image}
                                alt={product.name}
                                crossOrigin='anonymous'
                                className="w-full h-full object-cover transition-all duration-300"
                            />
                        </div>

                        {/* Gallery Section */}
                        {gallery.length > 0 && (
                            <div className="relative px-4 sm:px-6 py-4 border-t 
                                border-gray-100 dark:border-navy-800">
                                {/* Left Scroll Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        scrollGallery('left');
                                    }}
                                    className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 
                                        z-10 p-1.5 sm:p-2 rounded-full bg-white/90 shadow-lg 
                                        hover:bg-white dark:bg-navy-800/90 
                                        dark:hover:bg-navy-700 dark:text-gray-200
                                        transition-all duration-200"
                                >
                                    <BsArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>

                                {/* Scrollable Gallery Container */}
                                <div ref={galleryRef}
                                    className="flex gap-2 sm:gap-3 overflow-x-auto 
                                        scrollbar-hide scroll-smooth px-6 sm:px-8 py-2"
                                >
                                    <div className="flex gap-2 sm:gap-3">
                                        {/* Original Product Image */}
                                        <div onClick={() => setMainImage(product.image)}
                                            className={`flex-shrink-0 w-16 sm:w-24 h-16 sm:h-24 
                                                rounded-xl overflow-hidden border-2 
                                                transition-all duration-200 cursor-pointer
                                                ${mainImage === product.image
                                                    ? 'border-brand-500 shadow-lg'
                                                    : 'border-transparent hover:border-brand-500/50'}`}
                                        >
                                            <img src={product.image}
                                                alt="Main"
                                                crossOrigin='anonymous'
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Gallery Images */}
                                        {gallery.map((image) => (
                                            <div key={image.image_id}
                                                onClick={() => setMainImage(image.image_url)}
                                                className={`flex-shrink-0 w-16 sm:w-24 h-16 sm:h-24 
                                                    rounded-xl overflow-hidden border-2 
                                                    transition-all duration-200 cursor-pointer
                                                    ${mainImage === image.image_url
                                                        ? 'border-brand-500 shadow-lg'
                                                        : 'border-transparent hover:border-brand-500/50'}`}
                                            >
                                                <img src={image.image_url}
                                                    alt={image.alt_text || 'Gallery image'}
                                                    crossOrigin='anonymous'
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Scroll Button */}
                                <button onClick={(e) => {
                                    e.stopPropagation();
                                    scrollGallery('right');
                                }}
                                    className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 
                                        z-10 p-1.5 sm:p-2 rounded-full bg-white/90 shadow-lg 
                                        hover:bg-white dark:bg-navy-800/90 
                                        dark:hover:bg-navy-700 dark:text-gray-200
                                        transition-all duration-200"
                                >
                                    <BsArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Section Content */}
                    <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 
                        max-h-[60vh] md:max-h-none overflow-y-auto 
                        dark:text-gray-200">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 bg-white dark:bg-navy-800 top-4 p-2 
                                rounded-full hover:bg-gray-100 
                                dark:hover:bg-navy-700 transition-colors"
                        >
                            <BsX className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        </button>

                        {/* Product Info */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {productData?.name || product.name}
                                </h3>
                                <p className="mt-2 text-sm font-medium text-brand-500">
                                    {product.category}
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {displayOriginalPrice(product)}
                                </p>
                            </div>
                        </div>

                        {/* Benefits Section */}
                        {benefits.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Benefits
                                </h3>
                                <ul className="space-y-2">
                                    {benefits.map((benefit) => (
                                        <li key={benefit.benefit_id}
                                            className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                                            {benefit.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Variants Section */}
                        <div className="bg-gradient-to-br from-gray-50/50 to-white/50 
                            dark:from-navy-900 dark:to-navy-800 rounded-2xl mb-4
                            border border-gray-100/50 dark:border-navy-700">
                            <div className="flex items-center p-1 justify-between mb-4">
                                <p className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white/90">
                                    Select Variant
                                </p>
                                <span className="px-3 py-1 text-xs font-medium text-brand-500
                                    bg-brand-50/50 dark:bg-navy-700/50 rounded-full">
                                    {selectedVariant ? selectedVariant.name : 'Choose variant'}
                                </span>
                            </div>
                            <div className="relative">
                                {/* Left Scroll Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        scrollVariant('left');
                                    }}
                                    className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 p-2
                                        rounded-full bg-white/90 shadow-lg hover:bg-white 
                                        dark:bg-navy-800 dark:hover:bg-navy-700 dark:text-gray-300
                                        transition-all duration-200 border border-gray-100 dark:border-navy-700"
                                >
                                    <BsArrowLeft className="w-4 h-4" />
                                </button>

                                {/* Variants Scroll Container */}
                                <div ref={variantRef}
                                    className="flex gap-3 overflow-x-auto scrollbar-hide px-8 py-2">
                                    {variants.map((variant) => (
                                        <button
                                            key={variant.variant_id}
                                            onClick={() => handleVariantSelect(variant)}
                                            className={`flex-shrink-0 relative min-w-[120px] px-4 py-3 
                                                rounded-xl text-sm font-medium transition-all duration-300
                                                ${selectedVariant?.variant_id === variant.variant_id
                                                    ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg scale-[1.02]'
                                                    : 'bg-white dark:bg-navy-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700 border border-gray-100 dark:border-navy-700'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {variant.img_url && (
                                                    <img
                                                        src={variant.img_url}
                                                        alt={variant.name}
                                                        className="w-10 h-10 rounded-lg object-cover"
                                                        crossOrigin="anonymous"
                                                    />
                                                )}
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className={`tracking-wide font-medium ${selectedVariant?.variant_id === variant.variant_id
                                                        ? 'text-white font-semibold'
                                                        : 'text-gray-900 dark:text-white'}`}>
                                                        {variant.name}
                                                    </span>
                                                    {variant.skus && variant.skus[0] && (
                                                        <span className={`text-xs tracking-wide ${selectedVariant?.variant_id === variant.variant_id
                                                            ? 'text-white/90 font-medium'
                                                            : 'text-gray-500 dark:text-gray-400 font-normal'
                                                            }`}>
                                                            From {formatToRupiah(variant.skus[0].price)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {selectedVariant?.variant_id === variant.variant_id && (
                                                <span className="absolute -top-1 -right-1 w-3 h-3 
                                                    bg-green-500 rounded-full ring-2 ring-white 
                                                    dark:ring-navy-800"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Right Scroll Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        scrollVariant('right');
                                    }}
                                    className="absolute -right-1 top-1/2 -translate-y-1/2 z-10 p-2
                                        rounded-full bg-white/90 shadow-lg hover:bg-white 
                                        dark:bg-navy-800 dark:hover:bg-navy-700 dark:text-gray-300
                                        transition-all duration-200 border border-gray-100 dark:border-navy-700"
                                >
                                    <BsArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* SKU Selection Section */}
                        {selectedVariant && selectedVariant.skus && selectedVariant.skus.length > 0 && (
                            <div className="bg-gradient-to-br from-slate-50/70 to-white/80 
                                dark:from-navy-900 dark:to-indigo-900/50 rounded-2xl my-4
                                border border-gray-100/50 dark:border-navy-700/70 p-4">

                                <div className="flex items-center justify-between mb-3">
                                    <div className="space-y-0.5">
                                        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                                            Select SKU
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Choose specifications
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 text-xs font-medium text-brand-500
                                        bg-brand-50/50 dark:bg-navy-700/50 rounded-full">
                                        {selectedSku ? selectedSku.name : 'Choose SKU'}
                                    </span>
                                </div>

                                <div className="relative">
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        scrollSku('left');
                                    }}
                                        className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 p-2
                                            rounded-full bg-white/90 shadow-md hover:shadow-lg
                                            dark:bg-navy-800 dark:text-gray-300 transform hover:scale-105
                                            transition-all duration-200 border border-gray-100/70 dark:border-navy-700/70">
                                        <BsArrowLeft className="w-3.5 h-3.5" />
                                    </button>

                                    <div ref={skuRef}
                                        className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-6">
                                        {selectedVariant.skus.map((sku) => (
                                            <button key={sku.sku_id}
                                                onClick={() => onSkuSelect(sku)}
                                                className={`flex-shrink-0 relative min-w-[140px] px-3 py-2.5
                                                    rounded-xl text-sm font-medium transform
                                                    transition-all duration-200 hover:scale-[1.02]
                                                    ${selectedSku?.sku_id === sku.sku_id
                                                        ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md'
                                                        : 'bg-white/80 dark:bg-navy-800/80 hover:bg-white dark:hover:bg-navy-700/80 border border-gray-100 dark:border-navy-700'
                                                    }`}>

                                                <div className="flex flex-col items-start gap-1.5">
                                                    <span className={`text-sm ${selectedSku?.sku_id === sku.sku_id
                                                        ? 'text-white'
                                                        : 'text-gray-900 dark:text-white'
                                                        }`}>
                                                        {sku.name}
                                                    </span>
                                                    <span className={`text-xs font-medium ${selectedSku?.sku_id === sku.sku_id
                                                        ? 'text-white/90'
                                                        : 'text-brand-500 dark:text-brand-400'
                                                        }`}>
                                                        {formatToRupiah(sku.price)}
                                                    </span>
                                                </div>

                                                {selectedSku?.sku_id === sku.sku_id && (
                                                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3
                                                        bg-green-500 rounded-full ring-2 ring-white
                                                        dark:ring-navy-800 shadow-sm" />
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        scrollSku('right');
                                    }}
                                        className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 p-2
                                            rounded-full bg-white/90 shadow-md hover:shadow-lg
                                            dark:bg-navy-800 dark:text-gray-300 transform hover:scale-105
                                            transition-all duration-200 border border-gray-100/70 dark:border-navy-700/70">
                                        <BsArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Quantity Controls */}
                        <div className="p-4 border border-gray-100 dark:border-navy-700 rounded-2xl
                            dark:bg-navy-900/50">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Select Quantity
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Available: {product.stock}
                                </p>
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    disabled={quantity <= 1}
                                    className={`p-2 rounded-xl transition-colors ${quantity <= 1
                                        ? 'bg-gray-100 cursor-not-allowed text-gray-400 dark:bg-navy-800 dark:text-gray-600'
                                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-navy-700 dark:hover:bg-navy-600 dark:text-gray-300'
                                        }`}
                                >
                                    <BsDash className="w-5 h-5" />
                                </button>
                                <span className="text-xl font-semibold w-12 text-center dark:text-white">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                    disabled={quantity >= product.stock}
                                    className={`p-2 rounded-xl transition-colors ${quantity >= product.stock
                                        ? 'bg-gray-100 cursor-not-allowed text-gray-400 dark:bg-navy-800 dark:text-gray-600'
                                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-navy-700 dark:hover:bg-navy-600 dark:text-gray-300'
                                        }`}
                                >
                                    <BsPlus className="w-5 h-5" />
                                </button>
                            </div>
                            {quantity >= product.stock && (
                                <p className="mt-2 text-xs text-red-500 text-center">
                                    Maximum stock reached
                                </p>
                            )}
                        </div>

                        {/* Total Price */}
                        <div className="flex items-center justify-between py-4 border-t border-gray-100 
                            dark:border-navy-700">
                            <span className="text-gray-600 dark:text-gray-300">Total Price:</span>
                            <span className="px-3 py-1 text-lg font-medium text-brand-500
                                bg-brand-50/50 dark:bg-indigo-900/40 dark:text-brand-300 rounded-full">
                                {selectedSku
                                    ? calculateTotal(selectedSku.price, quantity)
                                    : 'Select SKU first'}
                            </span>
                        </div>

                        {/* Add to Cart Button */}
                        {renderModalButtons()}
                    </div>
                </div>
            </div>
        </div>
    );
};

ProductModal.defaultProps = {
    product: null,
    isBuyNow: false,
    selectedVariant: null,
    selectedSku: null,
    quantity: 1
};

export const BestProducts = () => {
    // States for product data
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);
    const [modalQuantity, setModalQuantity] = useState(1);

    // States for selected items
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedSku, setSelectedSku] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // Redux selectors
    const { baseURL } = useSelector((state) => state.auth);
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();

    // Handle variant selection
    const handleVariantSelect = (variant) => {
        setSelectedVariant(variant);
        setSelectedSku(null); // Reset SKU when variant changes
    };

    // Handle SKU selection
    const handleSkuSelect = (sku) => {
        setSelectedSku(sku);
    };

    const handleCartClick = (product) => {
        setSelectedProduct(product);
        setShowCartModal(true);
    };

    useEffect(() => {
        const fetchBestProducts = async () => {
            try {
                const response = await baseURL.get(API_CONFIG.ENDPOINTS.BEST_PRODUCTS);
                setProducts(response.data.data || []);
            } catch (err) {
                setError('Failed to fetch products');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBestProducts();
    }, [baseURL]);

    const handleAddToCart = async (product) => {
        try {
            if (!user) {
                navigate('/auth/sign-in');
                return;
            }

            if (!selectedVariant || !selectedSku) {
                console.error('Please select variant and SKU');
                return;
            }

            setIsLoading(true);

            const cartData = {
                product_id: product.product_id,
                variant_id: selectedVariant.variant_id,
                sku_id: selectedSku.sku_id,
                quantity: parseInt(modalQuantity), // Use modalQuantity here
                price: selectedSku.price
            };

            const response = await baseURL.post(API_CONFIG.ENDPOINTS.ADD_TO_CART, cartData);

            if (response.data.status === 'success') {
                setShowCartModal(false);
                // Reset selections
                setSelectedVariant(null);
                setSelectedSku(null);
                setModalQuantity(1);
            }

        } catch (error) {
            console.error('Error adding to cart:', error.response?.data?.message || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBuyNow = (product, quantity) => {
        const total = calculateTotal(product?.price, quantity);
        console.log('Buying now:', product, 'Total:', total);
    };

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
            easing: 'ease-out-cubic',
            offset: 100
        });
    }, []);

    return (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 relative">
            {/* Background Decoration */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-white to-emerald-50/50 
                    dark:from-indigo-950/30 dark:via-navy-900 dark:to-emerald-950/30" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22%23000%22 fill-opacity=%22.03%22 fill-rule=%22evenodd%22%3E%3Ccircle cx=%223%22 cy=%223%22 r=%223%22/%3E%3C/g%3E%3C/svg%3E')] 
                    dark:bg-[url('data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22%23fff%22 fill-opacity=%22.03%22 fill-rule=%22evenodd%22%3E%3Ccircle cx=%223%22 cy=%223%22 r=%223%22/%3E%3C/g%3E%3C/svg%3E')]
                    opacity-20" />
            </div>

            {/* Enhanced Header Section with Staggered Animations */}
            <div className="relative text-center mb-16 space-y-8">
                <div className="space-y-4" data-aos="fade-up" data-aos-duration="1000">
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight drop-shadow-xl"
                        data-aos="fade-down"
                        data-aos-delay="100">
                        <span className="inline-block bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 
                            dark:from-pink-400 dark:via-purple-300 dark:to-indigo-300 
                            bg-clip-text text-transparent animate-gradient-x transition-all duration-700">
                            Our Best Vaping Products
                        </span>
                    </h2>

                    {/* Animated Decorative Lines */}
                    <div className="flex items-center justify-center gap-3"
                        data-aos="zoom-in"
                        data-aos-delay="200">
                        <div className="w-16 h-1.5 bg-gradient-to-r from-brand-500 to-violet-500 rounded-full" />
                        <div className="w-4 h-1.5 bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full" />
                        <div className="w-8 h-1.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full" />
                    </div>

                    {/* Enhanced Description */}
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-200 max-w-2xl mx-auto 
                        leading-relaxed"
                        data-aos="fade-up"
                        data-aos-delay="300"
                        data-aos-duration="1000">
                        Discover our most popular vape devices, premium e-liquids, and accessories
                    </p>
                </div>

                {/* Enhanced Decorative Tags with Staggered Animation */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {['Premium Devices', 'Best E-Liquids', 'Original Products', 'Coils & Accessories'].map((tag, index) => (
                        <span key={tag}
                            data-aos="fade-up"
                            data-aos-delay={400 + (index * 100)}
                            data-aos-duration="800"
                            className="px-4 py-2 rounded-full text-sm font-medium 
                                bg-white/50 dark:bg-indigo-900/30 backdrop-blur-sm
                                border border-gray-100/80 dark:border-indigo-800/50
                                text-gray-600 dark:text-gray-200
                                transform transition-all duration-300
                                hover:scale-105 hover:bg-white/70 dark:hover:bg-indigo-800/40
                                hover:border-brand-500/30 dark:hover:border-indigo-600/50
                                shadow-sm dark:shadow-indigo-900/20">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Enhanced Product Grid with AOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-8">
                {products.map((product, index) => (
                    <div key={product.id}
                        data-aos="zoom-in-up"
                        data-aos-delay={index * 100}
                        data-aos-duration="800"
                        data-aos-anchor-placement="top-bottom"
                        className="transform transition-all duration-300 hover:-translate-y-2">
                        <NftCard
                            {...product}
                            url={'/auth/product-detail/' + product.product_id}
                            benefits={product.benefits} // Pass benefits array directly
                            productId={product.product_id} // Pass benefits array directly
                            isLiked={product.isLiked} // Pass benefits array directly
                            onCartClick={() => handleCartClick(product)}
                        />
                    </div>
                ))}
            </div>

            {/* Enhanced Loading State */}
            {loading && (
                <div className="flex items-center justify-center min-h-[400px]"
                    data-aos="fade-in">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 
                        border-brand-500/20 border-t-brand-500" />
                </div>
            )}

            {/* Cart Modal */}
            <ProductModal
                product={selectedProduct}
                show={showCartModal}
                onClose={() => setShowCartModal(false)}
                onAddToCart={handleAddToCart}
                selectedVariant={selectedVariant}
                selectedSku={selectedSku}
                onVariantSelect={handleVariantSelect}
                onSkuSelect={handleSkuSelect}
                quantity={modalQuantity}
                setQuantity={setModalQuantity}
            />
        </div>
    );
};

export default BestProducts;