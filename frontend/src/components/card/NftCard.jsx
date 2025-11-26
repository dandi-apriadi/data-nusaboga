import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react"; // Add this import
import Card from "components/card";
import { BsCheckCircleFill, BsXCircleFill, BsEye, BsCart4, BsFlag } from "react-icons/bs";
import PropTypes from 'prop-types';
import { toast } from "react-toastify";
import { API_CONFIG } from "utils/apiConfig";

const NftCard = ({
  name,
  category,
  price,
  image,
  status = "available",
  url,
  product_id,
  banner = false,
  totalOrders = 0
}) => {
  const navigate = useNavigate();
  const { baseURL } = useSelector((state) => state.auth);
  // Track banner state locally
  const [isBanner, setIsBanner] = useState(banner);
  // Track button loading state
  const [isToggling, setIsToggling] = useState(false);

  const statusConfig = {
    available: {
      icon: <BsCheckCircleFill className="w-3.5 h-3.5 text-green-500" />,
      text: "Available",
      textColor: "text-green-700 dark:text-green-400"
    },
    unavailable: {
      icon: <BsXCircleFill className="w-3.5 h-3.5 text-red-500" />,
      text: "Unavailable",
      textColor: "text-red-700 dark:text-red-400"
    }
  };

  const currentStatus = statusConfig[status?.toLowerCase()] || statusConfig.available;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(number).replace(/(\.0+|(\,[0-9]+)0)$/, "");
  };

  const handleToggleBanner = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsToggling(true);

    try {
      const response = await baseURL.patch(API_CONFIG.ENDPOINTS.TOGGLE_BANNER(product_id));

      if (response.data.status === 'success') {
        // Update local state instead of reloading
        setIsBanner(response.data.data.banner);
        toast.success('Product banner status updated successfully!');
      } else {
        toast.error('Failed to update banner status');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while updating banner status');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Card
      extra="flex flex-col w-full h-full bg-white dark:bg-navy-800 rounded-[20px] shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:transform hover:-translate-y-2"
    >
      <div className="flex flex-col h-full">
        <div className="relative group h-[240px] sm:h-[260px] md:h-[280px]">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="w-full h-full overflow-hidden rounded-t-[20px]">
            <img
              src={image}
              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
              alt={name}
              loading="lazy"
              crossOrigin="anonymous"
            />
          </div>

          {/* Status, Orders and Views Badges */}
          <div className="absolute top-3 left-3 right-3 z-20 flex justify-between">
            {/* Status Badge */}
            <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 backdrop-blur-sm dark:bg-navy-800/90">
              {currentStatus.icon}
              <p className={`text-sm font-medium ${currentStatus.textColor}`}>
                {currentStatus.text}
              </p>
            </div>

            <div className="flex gap-2">
              {/* Banner Button with conditional styling */}
              <button
                disabled={isToggling}
                onClick={handleToggleBanner}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 backdrop-blur-sm transition-colors
                  ${isBanner
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-white/90 hover:bg-white dark:bg-navy-800/90 dark:hover:bg-navy-700"}`}
              >
                <BsFlag className={`w-3.5 h-3.5 ${isBanner ? "text-white" : "text-brand-500"}`} />
                <p className={`text-sm font-medium ${isBanner ? "text-white" : "text-navy-700 dark:text-white"}`}>
                  {isToggling ? "..." : "Banner"}
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex flex-col flex-grow p-5 space-y-4">
          {/* Product Info and Category with Orders */}
          <div>
            <h3 className="font-bold text-lg text-navy-700 dark:text-white line-clamp-1 group-hover:text-brand-500 transition-colors">
              {name}
            </h3>
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {category}
              </p>
              <div className="flex items-center gap-1.5">
                <BsCart4 className="w-3.5 h-3.5 text-brand-500" />
                <span className="text-sm font-medium text-navy-700 dark:text-white">
                  {totalOrders}
                </span>
              </div>
            </div>
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-navy-700">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Price
              </p>
              <p className="text-lg font-bold text-navy-700 dark:text-white mt-0.5">
                {formatRupiah(price)}
              </p>
            </div>
            <div className="flex absolute bottom-4 right-1 gap-2">
              <button
                onClick={() => navigate(url)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg flex items-center gap-1 transition-all duration-200 hover:shadow-md dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600"
              >
                <BsEye className="w-3.5 h-3.5" />
                Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

NftCard.propTypes = {
  name: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
  status: PropTypes.oneOf(['available', 'unavailable']),
  url: PropTypes.string.isRequired,
  product_id: PropTypes.string.isRequired,
  banner: PropTypes.bool,
  totalViews: PropTypes.number,
  totalOrders: PropTypes.number,
  checkout: PropTypes.string
};

export default NftCard;